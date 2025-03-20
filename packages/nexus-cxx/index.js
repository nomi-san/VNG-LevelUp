const path = require('path');
const bindings = require('node-gyp-build')(path.resolve(__dirname));
const constants = require('./src/consts');

/**
 * Creates a file mapping object with specified size, protection, and file name.
 * 
 * @param {string} fileName - The name of the file to map.
 * @param {number} sizeInBytes - The size of the file mapping in bytes.
 * @param {number} pageProtection - The protection of the pages to be mapped.
 * @throws {Error} If any error occurs.
 * @returns {*} The handle to the newly created file mapping object.
 */
function createFileMappingA(fileName, sizeInBytes, pageProtection) {
  return bindings.createFileMappingA(fileName, sizeInBytes, pageProtection);
}

/**
 * Opens a process with the specified identifier.
 * 
 * @param {number} processIdentifier - The identifier of the process to open.
 * @throws {Error} If any error occurs.
 * @returns {*} The process info.
 */
function openProcess(processId) {
  return bindings.openProcess(processId);
}

/**
 * Closes a handle to a resource.
 * 
 * @param {*} handle - The handle to close.
 * @throws {Error} If any error occurs.
 * @returns {boolean} The result of closing the handle.
 */
function closeHandle(handle) {
  return bindings.closeHandle(handle);
}

/**
 * Reads a buffer from a specified memory address.
 * 
 * @param {*} handle - The handle of the process to read from.
 * @param {number} address - The starting address to read from.
 * @param {number} size - The size of the buffer to read.
 * @throws {Error} If any error occurs.
 * @returns {Buffer} The read buffer.
 */
function readBuffer(handle, address, size) {
  return bindings.readBuffer(handle, address, size);
}

/**
 * Writes a buffer to a specified memory address.
 * 
 * @param {*} handle - The handle of the process to write to.
 * @param {number} address - The starting address to write to.
 * @param {Buffer} buffer - The buffer to write.
 * @throws {Error} If any error occurs.
 * @returns {boolean} The result of the write operation.
 */
function writeBuffer(handle, address, buffer) {
  return bindings.writeBuffer(handle, address, buffer);
}

/**
 * Opens a file mapping with the specified file name.
 * 
 * @param {string} fileName - The name of the file mapping to open.
 * @throws {Error} If any error occurs.
 * @returns {*} The handle to the file mapping.
 */
function openFileMapping(fileName) {
  if (arguments.length !== 1 || typeof fileName !== 'string') {
    throw new Error('invalid arguments!');
  }
  return bindings.openFileMapping(fileName);
}

/**
 * Maps a view of a file into the address space of a process.
 * 
 * @param {number} processHandle - The handle of the process.
 * @param {number} fileHandle - The handle of the file mapping object.
 * @param {number|bigint} [offset=0] - The offset in the file where the view begins.
 * @param {number|bigint} [viewSize=0] - The size of the view in bytes.
 * @param {number} [pageProtection=constants.PAGE_READONLY] - The protection of the page.
 * @throws {Error} If any error occurs.
 * @returns {*} The base address of the mapped view, if successful.
 */
function mapViewOfFile2(processHandle, fileHandle, offset, viewSize, pageProtection) {
  const validArgs = [
    ['number', 'number'],
    ['number', 'number', 'number', 'number', 'number'],
    ['number', 'number', 'bigint', 'bigint', 'number']
  ];
  const receivedArgs = Array.from(arguments).map(arg => typeof arg);

  if (!validArgs.some(args => args.join(",") == receivedArgs.join(","))) {
    throw new Error('invalid arguments!');
  }
  if (arguments.length == 2) {
    return bindings.mapViewOfFile2(processHandle, fileHandle, 0, 0, constants.PAGE_READONLY);
  }
  return bindings.mapViewOfFile2(processHandle, fileHandle, offset, viewSize, pageProtection);
}

const library = {
  createFileMappingA,
  openProcess,
  closeHandle,
  readBuffer,
  writeBuffer,
  openFileMapping,
  mapViewOfFile2,
};

module.exports = {
  ...constants,
  ...library,
};
