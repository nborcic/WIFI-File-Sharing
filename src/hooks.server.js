import Bonjour from 'bonjour';

const bonjour = new Bonjour();

const service = bonjour.publish({
  name: 'WIFI File Sharing',
  type: 'http',
  port: 5173 
});

process.on('exit', () => {
  service.stop();
  bonjour.destroy();
});

export async function handle({ event, resolve }) {
  return resolve(event);
} 