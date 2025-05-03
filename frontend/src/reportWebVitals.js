import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry); // Instead of getCLS(onPerfEntry)
    onFID(onPerfEntry); // Instead of getFID(onPerfEntry)
    onFCP(onPerfEntry); // Instead of getFCP(onPerfEntry)
    onLCP(onPerfEntry); // Instead of getLCP(onPerfEntry)
    onTTFB(onPerfEntry); // Instead of getTTFB(onPerfEntry)
  }
};