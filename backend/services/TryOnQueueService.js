// Try-On Job Queue Service
const axios = require('axios');
const TryOnSession = require('../models/TryOnSession');
const TryOnResult = require('../models/TryOnResult');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_RETRIES = 3;

class TryOnQueueService {
  constructor() {
    this.activeJobs = new Map();
    this.jobTimers = new Map();
  }

  /**
   * Submit a new try-on job to the Python service
   */
  async submitJob(sessionId, bodyImagePath, garmentImagePath = null) {
    try {
      console.log(`📤 Submitting job for session ${sessionId}`);

      // Update session status
      await TryOnSession.findOneAndUpdate(
        { sessionId },
        { 
          status: 'processing',
          processingStartedAt: new Date()
        }
      );

      // Create form data for Python service
      const form = new FormData();
      form.append('image', fs.createReadStream(bodyImagePath));
      
      if (garmentImagePath && fs.existsSync(garmentImagePath)) {
        form.append('garment', fs.createReadStream(garmentImagePath));
      }

      // Submit to Python service
      const response = await axios.post(`${PYTHON_SERVICE_URL}/tryon`, form, {
        headers: form.getHeaders(),
        timeout: 30000
      });

      if (!response.data.job_id) {
        throw new Error('No job ID returned from Python service');
      }

      const jobId = response.data.job_id;

      // Store job info
      this.activeJobs.set(sessionId, {
        sessionId,
        jobId,
        status: 'queued',
        retries: 0,
        submittedAt: new Date()
      });

      // Update session with job ID
      await TryOnSession.findOneAndUpdate(
        { sessionId },
        { jobId }
      );

      // Start processing the job
      this.processJob(jobId, sessionId);

      return {
        success: true,
        jobId,
        sessionId
      };

    } catch (error) {
      console.error('❌ Job submission error:', error.message);
      
      await TryOnSession.findOneAndUpdate(
        { sessionId },
        { 
          status: 'failed',
          errorMessage: error.message
        }
      );

      throw error;
    }
  }

  /**
   * Process a submitted job (trigger Python service to process)
   */
  async processJob(jobId, sessionId) {
    try {
      // Tell Python service to start processing
      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/tryon/${jobId}/process`,
        {},
        { timeout: 120000 } // 2 minute timeout for processing
      );

      if (response.data.success) {
        // Processing completed successfully
        await this.handleJobCompletion(sessionId, response.data.result);
      } else {
        throw new Error(response.data.error || 'Processing failed');
      }

    } catch (error) {
      console.error(`❌ Job processing error for ${jobId}:`, error.message);
      await this.handleJobFailure(sessionId, error.message);
    }
  }

  /**
   * Poll job status from Python service
   */
  async pollJobStatus(jobId, sessionId) {
    try {
      const response = await axios.get(
        `${PYTHON_SERVICE_URL}/tryon/${jobId}/status`,
        { timeout: 5000 }
      );

      const jobData = response.data;
      const job = this.activeJobs.get(sessionId);

      if (job) {
        job.status = jobData.status;
        job.progress = jobData.progress || 0;
      }

      // Update session progress
      await TryOnSession.findOneAndUpdate(
        { sessionId },
        { 
          'metadata.progress': jobData.progress || 0
        }
      );

      return jobData;

    } catch (error) {
      console.error(`Polling error for job ${jobId}:`, error.message);
      return null;
    }
  }

  /**
   * Handle successful job completion
   */
  async handleJobCompletion(sessionId, resultData) {
    try {
      console.log(`✅ Job completed for session ${sessionId}`);

      const session = await TryOnSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Session not found');
      }

      // Create result record
      const result = await TryOnResult.create({
        userId: session.userId,
        sessionId: session.sessionId,
        resultImage: {
          path: resultData.result_path,
          url: resultData.result_url,
          metadata: {
            processingTime: resultData.processing_time
          }
        },
        score: {
          overall: resultData.quality_score || 0.9,
          confidence: resultData.quality_score || 0.9
        },
        aiMetrics: {
          processingTime: resultData.processing_time,
          inferenceQuality: resultData.quality_score || 0.9
        }
      });

      // Update session
      await TryOnSession.findOneAndUpdate(
        { sessionId },
        {
          status: 'completed',
          processingCompletedAt: new Date(),
          $push: { resultIds: result._id }
        }
      );

      // Clean up
      this.activeJobs.delete(sessionId);
      if (this.jobTimers.has(sessionId)) {
        clearInterval(this.jobTimers.get(sessionId));
        this.jobTimers.delete(sessionId);
      }

      return result;

    } catch (error) {
      console.error('Error handling job completion:', error);
      throw error;
    }
  }

  /**
   * Handle job failure
   */
  async handleJobFailure(sessionId, errorMessage) {
    try {
      console.log(`❌ Job failed for session ${sessionId}: ${errorMessage}`);

      const job = this.activeJobs.get(sessionId);
      
      if (job && job.retries < MAX_RETRIES) {
        // Retry the job
        job.retries++;
        console.log(`🔄 Retrying job ${job.jobId} (attempt ${job.retries}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          this.processJob(job.jobId, sessionId);
        }, 5000 * job.retries); // Exponential backoff
        
        return;
      }

      // Max retries reached, mark as failed
      await TryOnSession.findOneAndUpdate(
        { sessionId },
        {
          status: 'failed',
          errorMessage: errorMessage || 'Processing failed after retries'
        }
      );

      // Clean up
      this.activeJobs.delete(sessionId);
      if (this.jobTimers.has(sessionId)) {
        clearInterval(this.jobTimers.get(sessionId));
        this.jobTimers.delete(sessionId);
      }

    } catch (error) {
      console.error('Error handling job failure:', error);
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(sessionId) {
    const job = this.activeJobs.get(sessionId);
    if (!job) {
      // Check database
      const session = await TryOnSession.findOne({ sessionId });
      if (!session) {
        return null;
      }
      
      return {
        sessionId: session.sessionId,
        status: session.status,
        jobId: session.jobId
      };
    }

    return job;
  }

  /**
   * Cancel a job
   */
  async cancelJob(sessionId) {
    const job = this.activeJobs.get(sessionId);
    if (job) {
      this.activeJobs.delete(sessionId);
      if (this.jobTimers.has(sessionId)) {
        clearInterval(this.jobTimers.get(sessionId));
        this.jobTimers.delete(sessionId);
      }
    }

    await TryOnSession.findOneAndUpdate(
      { sessionId },
      { status: 'cancelled' }
    );

    return { success: true, message: 'Job cancelled' };
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const activeCount = this.activeJobs.size;
    const jobs = Array.from(this.activeJobs.values());
    
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    return {
      activeJobs: activeCount,
      statusBreakdown: statusCounts,
      jobs: jobs.map(j => ({
        sessionId: j.sessionId,
        jobId: j.jobId,
        status: j.status,
        retries: j.retries
      }))
    };
  }
}

// Singleton instance
const tryOnQueueService = new TryOnQueueService();

module.exports = tryOnQueueService;
