console.log('Unregistering all service workers...');
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
    console.log('Service worker unregistered:', registration);
  });
  console.log('All service workers unregistered. Clearing caches...');
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('All caches cleared! Reload the page now.');
    alert('Service worker and caches cleared! Reloading in 2 seconds...');
    setTimeout(() => window.location.reload(true), 2000);
  });
});
