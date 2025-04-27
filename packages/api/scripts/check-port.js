#!/usr/bin/env node

/**
 * This script checks if the specified port is in use and optionally kills the process using it.
 * Usage: node check-port.js [port] [--kill]
 * Example: node check-port.js 3001 --kill
 */

const { execSync } = require('child_process');
const os = require('os');

// Default port to check
const DEFAULT_PORT = 3001;

// Parse command line arguments
const args = process.argv.slice(2);
const port = args[0] ? parseInt(args[0], 10) : DEFAULT_PORT;
const shouldKill = args.includes('--kill');

// Check if the port is valid
if (isNaN(port) || port < 0 || port > 65535) {
  console.error(`Invalid port number: ${args[0]}`);
  process.exit(1);
}

// Function to check if a port is in use
function isPortInUse(port) {
  try {
    let command;
    if (os.platform() === 'win32') {
      // Windows
      command = `netstat -ano | findstr :${port}`;
    } else {
      // macOS, Linux
      command = `lsof -i :${port} | grep LISTEN`;
    }
    
    const result = execSync(command, { encoding: 'utf8' });
    return result.trim().length > 0 ? result : false;
  } catch (error) {
    // If the command fails, the port is likely not in use
    return false;
  }
}

// Function to kill the process using the port
function killProcess(port) {
  try {
    let pid;
    let command;
    
    if (os.platform() === 'win32') {
      // Windows - extract PID from netstat output
      const netstatOutput = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = netstatOutput.split('\n').filter(line => line.includes(`LISTENING`));
      if (lines.length > 0) {
        const pidMatch = lines[0].match(/(\d+)$/);
        if (pidMatch && pidMatch[1]) {
          pid = pidMatch[1];
        }
      }
    } else {
      // macOS, Linux - extract PID from lsof output
      const lsofOutput = execSync(`lsof -i :${port} | grep LISTEN`, { encoding: 'utf8' });
      const lines = lsofOutput.split('\n').filter(Boolean);
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        if (parts.length >= 2) {
          pid = parts[1];
        }
      }
    }
    
    if (pid) {
      console.log(`Killing process ${pid} using port ${port}...`);
      if (os.platform() === 'win32') {
        command = `taskkill /F /PID ${pid}`;
      } else {
        command = `kill -9 ${pid}`;
      }
      execSync(command);
      console.log(`Process ${pid} killed successfully.`);
      return true;
    } else {
      console.error(`Could not find PID for process using port ${port}.`);
      return false;
    }
  } catch (error) {
    console.error(`Error killing process on port ${port}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log(`Checking if port ${port} is in use...`);
  
  const portStatus = isPortInUse(port);
  
  if (portStatus) {
    console.log(`Port ${port} is in use.`);
    console.log(portStatus);
    
    if (shouldKill) {
      const killed = killProcess(port);
      if (killed) {
        console.log(`Port ${port} is now available.`);
        process.exit(0);
      } else {
        console.error(`Failed to free port ${port}.`);
        process.exit(1);
      }
    } else {
      console.log(`Use --kill option to terminate the process using port ${port}.`);
      process.exit(1);
    }
  } else {
    console.log(`Port ${port} is available.`);
    process.exit(0);
  }
}

// Run the main function
main();
