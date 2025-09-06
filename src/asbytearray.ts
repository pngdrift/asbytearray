import * as zlib from 'zlib';

class ByteArray {

    public buffer: Buffer;


    private _position: number = 0;

    private _endian: Endian = Endian.BIG_ENDIAN;

    constructor(buffer: Buffer = Buffer.allocUnsafe(0)) {
        this.buffer = buffer;
    }

    /**
     * Moves, or returns the current position, in bytes, of the file
     * pointer into the ByteArray object. This is the point at which the
     * next call to a read method starts reading or a write method starts
     * writing.
     */
    public get position(): number {
        return this._position;
    }

    /**
     * Moves, or returns the current position, in bytes, of the file
     * pointer into the ByteArray object. This is the point at which the
     * next call to a read method starts reading or a write method starts
     * writing.
     */
    public set position(value: number) {
        this._position = value;
    }

    /**
    * Changes or reads the byte order for the data; either
    * Endian.BIG_ENDIAN or Endian.LITTLE_ENDIAN.
    */
    public get endian(): Endian {
        return this._endian;
    }

    /**
    * Changes or reads the byte order for the data; either
    * Endian.BIG_ENDIAN or Endian.LITTLE_ENDIAN.
    */
    public set endian(value: Endian) {
        this._endian = value;
    }

    /**
     * The length of the ByteArray object, in bytes.
     *
     * If the length is set to a value that is larger than the current
     * length, the right side  of the byte array is filled with zeros.
     *
     * If the length is set to a value that is smaller than the current
     * length, the byte array is truncated.
     */
    public get length(): number {
        return this.buffer.byteLength;
    }

    /**
     * The length of the ByteArray object, in bytes.
     *
     * If the length is set to a value that is larger than the current
     * length, the right side  of the byte array is filled with zeros.
     *
     * If the length is set to a value that is smaller than the current
     * length, the byte array is truncated.
     */
    public set length(value: number) {
        if (value > this.buffer.length) {
            const newData = Buffer.alloc(value);
            this.buffer.copy(newData);
            this.buffer = newData;
        }
        else if (value < this.buffer.length) {
            const newData = Buffer.allocUnsafe(value);
            this.buffer.copy(newData, 0, 0, value);
            this.buffer = newData;
        }
    }

    /**
     * The number of bytes of data available for reading from the current
     * position in the byte array to the end of the array.
     *
     * Use the bytesAvailable property in conjunction with the read methods
     * each time you access a ByteArray object to ensure that you are
     * reading valid data.
     */
    public get bytesAvailable(): number {
        return this.buffer.byteLength - this.position;
    }

    /**
     * Clears the contents of the byte array and resets the length and
     * position properties to 0. Calling this method explicitly frees up
     * the memory used by the ByteArray instance.
     */
    public clear(): void {
        this.buffer = Buffer.allocUnsafe(0);
        this.position = 0;
    }

    /**
     * zlib deflate
     */
    public compress(): void {
        const compressedData = zlib.deflateSync(this.buffer);
        this.buffer = compressedData;
        this.position = 0;
    }

    /**
     * zlib inflate
     */
    public uncompress(): void {
        const uncompressedData = zlib.inflateSync(this.buffer);
        this.buffer = uncompressedData;
        this.position = 0;
    }

    /**
     * Writes a sequence of length bytes from the specified byte array,
     * bytes, starting offset(zero-based index) bytes into the byte stream.
     *
     * If the length parameter is omitted, the default length of 0 is used;
     * the method writes the entire buffer starting at offset. If the
     * offset parameter is also omitted, the entire buffer is written.
     *
     *
     *
     * If offset or length is out of range, they are clamped to the
     * beginning and end of the bytes array.
     *
     * @param bytes The ByteArray object.
     *
     * @param offset A zero-based index indicating the position into the
     * array to begin writing.
     *
     * @param length An unsigned integer indicating how far into the buffer
     * to write.
     */
    public writeBytes(bytes: ByteArray, offset: number = 0, length?: number): void {
        length = length || bytes.length - offset;
        this.checkBuffer(length);
        bytes.buffer.copy(this.buffer, this.position, offset, offset + length);
        this.position += length;
    }

    /**
     * Reads the number of data bytes, specified by the length parameter,
     * from the byte stream. The bytes are read into the ByteArray object
     * specified by the bytes parameter, and the bytes are written into the
     * destination ByteArray starting at the position specified by offset.
     *
     * @param bytes The ByteArray object to read data into.
     *
     * @param offset The offset (position) in bytes at which the read data
     * should be written.
     *
     * @param length The number of bytes to read.  The default value of 0
     * causes all available data to be read.
     */
    public readBytes(bytes: ByteArray, offset: number = 0, length?: number): void {
        length = length || this.bytesAvailable;
        if ((bytes.length - bytes.position) < length) {
            bytes.buffer = Buffer.concat([bytes.buffer, Buffer.allocUnsafe(length)]);
        }
        this.buffer.copy(bytes.buffer, offset, this.position, this.position + length);
        this.position += length;
    }

    /**
     * Writes a Boolean value. A single byte is written according to the
     * value parameter, either 1 if true or 0 if false.
     *
     * @param value A Boolean value determining which byte is written. If
     * the parameter is true,      the method writes a 1; if false, the
     * method writes a 0.
     */
    public writeBoolean(value: boolean) {
        this.checkBuffer(1);
        this.buffer.writeInt8(Number(value), this.position)
        this.position += 1;
    }

    /**
     * Reads a Boolean value from the byte stream. A single byte is read,
     * and true is returned if the byte is nonzero, false otherwise.
     *
     * @return Returns true if the byte is nonzero, false otherwise.
     */
    public readBoolean(): boolean {
        const result = this.buffer.readInt8(this.position) > 0;
        this.position += 1;
        return result;
    }

    /**
     * Writes a byte to the byte stream.
     *
     * The low 8 bits of the parameter are used. The high 24 bits are
     * ignored.
     *
     * @param value A integer. The low 8 bits are written to the byte
     * stream.
     */
    public writeByte(value: number): void {
        this.checkBuffer(1);
        this.buffer.writeUInt8(value & 0xFF, this.position);
        this.position += 1;
    }

    /**
     * Reads a signed byte from the byte stream.
     *
     * The returned value is in the range -128 to 127.
     *
     * @return An integer between -128 and 127.
     */
    public readByte(): number {
        const result = this.buffer.readInt8(this.position);
        this.position += 1;
        return result;
    }

    /**
     * Reads an unsigned byte from the byte stream.
     *
     * The returned value is in the range 0 to 255.
     *
     * @return A 32-bit unsigned integer between 0 and 255.
     */
    public readUnsignedByte(): number {
        const result = this.buffer.readUInt8(this.position);
        this.position += 1;
        return result;
    }

    /**
     * Writes a 16-bit integer to the byte stream. The low 16 bits of the
     * parameter are used. The high 16 bits are ignored.
     *
     * @param value integer, whose low 16 bits are written to the
     * byte stream.
     */
    public writeShort(value: number): void {
        this.checkBuffer(2);
        if (this.endian === Endian.BIG_ENDIAN) {
            this.buffer.writeUInt16BE(value & 0xFFFF, this.position);
        }
        else {
            this.buffer.writeUInt16LE(value & 0xFFFF, this.position);
        }
        this.position += 2;
    }

    /**
     * Reads a signed 16-bit integer from the byte stream.
     *
     * The returned value is in the range -32768 to 32767.
     *
     * @return A 16-bit signed integer between -32768 and 32767.
     */
    public readShort(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readInt16BE(this.position) : this.buffer.readInt16LE(this.position);
        this.position += 2;
        return result;
    }

    /**
     * Reads an unsigned 16-bit integer from the byte stream.
     *
     * The returned value is in the range 0 to 65535.
     *
     * @return A 16-bit unsigned integer between 0 and 65535.
     */
    public readUnsignedShort(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readUInt16BE(this.position) : this.buffer.readUInt16LE(this.position);
        this.position += 2;
        return result;
    }

    /**
     * Writes a 32-bit integer to the byte stream.
     *
     * @param value An integer to write to the byte stream.
     */
    public writeInt(value: number): void {
        this.checkBuffer(4);
        if (this.endian === Endian.BIG_ENDIAN) {
            this.buffer.writeUInt32BE(value & 0xFFFFFFFF, this.position);
        }
        else {
            this.buffer.writeUInt32LE(value & 0xFFFFFFFF, this.position);
        }
        this.position += 4;
    }

    /**
     * Reads a signed 32-bit integer from the byte stream.
     *
     * The returned value is in the range -2147483648 to 2147483647.
     *
     * @return A 32-bit signed integer between -2147483648 and 2147483647.
     */
    public readInt(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readInt32BE(this.position) : this.buffer.readInt32LE(this.position);
        this.position += 4;
        return result;
    }

    /**
     * Reads an unsigned 32-bit integer from the byte stream.
     *
     * The returned value is in the range 0 to 4294967295.
     *
     * @return A 32-bit unsigned integer between 0 and 4294967295.
     */
    public readUnsignedInt(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readUInt32BE(this.position) : this.buffer.readUInt32LE(this.position);
        this.position += 4;
        return result;
    }

    /**
     * Writes an IEEE 754 single-precision (32-bit) floating-point number
     * to the byte stream.
     *
     * @param value A single-precision (32-bit) floating-point number.
     */
    public writeFloat(value: number): void {
        this.checkBuffer(4);
        if (this.endian === Endian.BIG_ENDIAN) {
            this.buffer.writeFloatBE(value, this.position);
        }
        else {
            this.buffer.writeFloatLE(value, this.position);
        }
        this.position += 4;
    }

    /**
     * Reads a signed 32-bit integer from the byte stream.
     *
     * The returned value is in the range -2147483648 to 2147483647.
     *
     * @return A 32-bit signed integer between -2147483648 and 2147483647.
     */
    public readFloat(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readFloatBE(this.position) : this.buffer.readFloatLE(this.position);
        this.position += 4;
        return result;
    }

    /**
     * Writes an IEEE 754 double-precision (64-bit) floating-point number
     * to the byte stream.
     *
     * @param value A double-precision (64-bit) floating-point number.
     */
    public writeDouble(value: number): void {
        this.checkBuffer(8);
        if (this.endian === Endian.BIG_ENDIAN) {
            this.buffer.writeDoubleBE(value, this.position);
        }
        else {
            this.buffer.writeDoubleLE(value, this.position);
        }
        this.position += 8;
    }

    /**
     * Reads an IEEE 754 single-precision (32-bit) floating-point number
     * from the byte stream.
     *
     * @return A single-precision (32-bit) floating-point number.
     *
     * @throws EOFError There is not sufficient data available      to
     * read.
     */
    public readDouble(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readDoubleBE(this.position) : this.buffer.readDoubleLE(this.position);
        this.position += 8;
        return result;
    }

    /**
     * Writes a UTF-8 string to the byte stream. The length of the UTF-8
     * string in bytes is written first, as a 16-bit integer, followed by
     * the bytes representing the characters of the string.
     *
     * @param value The string value to be written.
     *
     * @throws RangeError If the length is larger than      65535.
     */
    public writeUTF(value: string): void {
        const length = Buffer.byteLength(value, 'utf8');
        if (length > 65535) {
            throw new RangeError();
        }
        this.writeShort(length);
        this.checkBuffer(length);
        this.buffer.write(value, this.position, 'utf8');
        this.position += length;
    }

    /**
     * Reads a UTF-8 string from the byte stream.  The string is assumed to
     * be prefixed with an unsigned short indicating the length in bytes.
     *
     * @return UTF-8 encoded  string.
     */
    public readUTF(): string {
        const length = this.readShort();
        const value = this.buffer.toString('utf8', this.position, this.position + length);
        this.position += length;
        return value;
    }

    /**
     * Writes a UTF-8 string to the byte stream. Similar to the writeUTF()
     * method, but writeUTFBytes() does not prefix the string with a 16-bit
     * length word.
     *
     * @param value The string value to be written.
     */
    public writeUTFBytes(value: string): void {
        const byteLength = Buffer.byteLength(value);
        this.checkBuffer(byteLength);
        this.buffer.write(value, this.position, "utf8");
        this.position += byteLength;
    }

    /**
     * Reads a sequence of UTF-8 bytes specified by the length parameter
     * from the byte stream and returns a string.
     *
     * @param length An unsigned short indicating the length of the UTF-8
     * bytes.
     *
     * @return A string composed of the UTF-8 bytes of the specified
     * length.
     */
    public readUTFBytes(length: number): string {
        const result = this.buffer.toString('utf8', this.position, this.position + length);
        this.position += length;
        return result;
    }

    private checkBuffer(size: number): void {
        const diff = this.buffer.length - this.position;
        if (diff < size) {
            this.buffer = Buffer.concat([this.buffer, Buffer.allocUnsafe(size)]);
        }
    }

}

enum Endian {

    /**
         * Indicates the most significant byte of the multibyte number appears
         * first in the sequence of bytes.
         *
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits
         * per byte). The most significant byte is 0x12.  The least significant
         * byte is 0x78. (For the equivalent decimal number, 305419896, the
         * most significant digit is 3, and the least significant digit is 6).
         *
         * A stream using the bigEndian byte order (the most significant byte
         * first) writes:
         *
         * 12 34 56 78
         */
    BIG_ENDIAN = "bigEndian",

    /**
         * Indicates the least significant byte of the multibyte number appears
         * first in the sequence of bytes.
         *
         * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits
         * per byte). The most significant byte is 0x12.  The least significant
         * byte is 0x78. (For the equivalent decimal number, 305419896, the
         * most significant digit is 3, and the least significant digit is 6).
         *
         * A stream using the littleEndian byte order (the least significant
         * byte first) writes:
         *
         * 78 56 34 12
         */
    LITTLE_ENDIAN = "littleEndian",
}

export { ByteArray, Endian };