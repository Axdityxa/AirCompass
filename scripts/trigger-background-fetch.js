/**
 * This script manually triggers a notification for testing purposes
 * Run with: npm run background-fetch-test
 */

const { exec } = require('child_process');
const path = require('path');

// This forces a higher AQI value for testing
console.log('Triggering a test notification...');

// Execute adb command to trigger the background task (requires device to be connected)
const adbCommand = 'adb shell cmd jobscheduler run -f com.axdityxa.aircompass 999';

exec(adbCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    console.log('Alternative: Manually trigger a notification by:');
    console.log('1. Open app settings > Battery > Disable all optimization');
    console.log('2. Restart the app completely');
    return;
  }
  
  if (stderr) {
    console.error(`Command stderr: ${stderr}`);
    return;
  }
  
  console.log(`Command output: ${stdout}`);
  console.log('Background task triggered. Check your device for notifications.');
}); 