import * as zlib from 'zlib';

class ByteArray {

    public buffer: Buffer;

    public position: number = 0;

    private _endian: Endian = Endian.BIG_ENDIAN;

    constructor(buffer: Buffer = Buffer.allocUnsafe(0)) {
        this.buffer = buffer;
    }

    public get endian(): Endian {
        return this._endian;
    }

    public set endian(value: Endian) {
        this._endian = value;
    }

    public get length(): number {
        return this.buffer.byteLength;
    }

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

    public get bytesAvailable(): number {
        return this.buffer.byteLength - this.position;
    }

    public clear(): void {
        this.buffer = Buffer.allocUnsafe(0);
        this.position = 0;
    }

    public compress(algorithm: string = 'zlib'): void {
        const compressedData = zlib.deflateSync(this.buffer);
        this.buffer = compressedData;
        this.position = 0;
    }

    public uncompress(algorithm: string = 'zlib'): void {
        const uncompressedData = zlib.inflateSync(this.buffer);
        this.buffer = uncompressedData;
        this.position = 0;
    }

    public writeBytes(bytes: ByteArray, offset: number = 0, length?: number): void {
        length = length || bytes.length - offset;
        this.checkBuffer(length);
        bytes.buffer.copy(this.buffer, this.position, offset, offset + length);
        this.position += length;
    }

    public readBytes(bytes: ByteArray, offset: number = 0, length?: number): void {
        length = length || this.bytesAvailable;
        if ((bytes.length - bytes.position) < length) {
            bytes.buffer = Buffer.concat([bytes.buffer, Buffer.allocUnsafe(length)]);
        }
        this.buffer.copy(bytes.buffer, offset, this.position, this.position + length);
        this.position += length;
    }

    public writeBoolean(value: boolean) {
        this.checkBuffer(1);
        this.buffer.writeInt8(Number(value), this.position)
        this.position += 1;
    }

    public readBoolean(): boolean {
        const result = this.buffer.readInt8(this.position) > 0;
        this.position += 1;
        return result;
    }

    public writeByte(value: number): void {
        this.checkBuffer(1);
        this.buffer.writeUInt8(value & 0xFF, this.position);
        this.position += 1;
    }

    public readByte(): number {
        const result = this.buffer.readInt8(this.position);
        this.position += 1;
        return result;
    }

    public readUnsignedByte(): number {
        const result = this.buffer.readUInt8(this.position);
        this.position += 1;
        return result;
    }

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

    public readShort(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readInt16BE(this.position) : this.buffer.readInt16LE(this.position);
        this.position += 2;
        return result;
    }

    public readUnsignedShort(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readUInt16BE(this.position) : this.buffer.readUInt16LE(this.position);
        this.position += 2;
        return result;
    }

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

    public readInt(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readInt32BE(this.position) : this.buffer.readInt32LE(this.position);
        this.position += 4;
        return result;
    }

    public readUnsignedInt(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readUInt32BE(this.position) : this.buffer.readUInt32LE(this.position);
        this.position += 4;
        return result;
    }

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

    public readFloat(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readFloatBE(this.position) : this.buffer.readFloatLE(this.position);
        this.position += 4;
        return result;
    }

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

    public readDouble(): number {
        const result = this.endian === Endian.BIG_ENDIAN ? this.buffer.readDoubleBE(this.position) : this.buffer.readDoubleLE(this.position);
        this.position += 8;
        return result;
    }

    public writeUTF(value: string): void {
        const length = Buffer.byteLength(value, 'utf8');
        this.writeShort(length);
        this.checkBuffer(length);
        this.buffer.write(value, this.position, 'utf8');
        this.position += length;
    }

    public readUTF(): string {
        const length = this.readShort();
        const value = this.buffer.toString('utf8', this.position, this.position + length);
        this.position += length;
        return value;
    }

    public writeUTFBytes(value: string): void {
        const byteLength = Buffer.byteLength(value);
        this.checkBuffer(byteLength);
        this.buffer.write(value, this.position, "utf8");
        this.position += byteLength;
    }

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
    BIG_ENDIAN = "bigEndian",
    LITTLE_ENDIAN = "littleEndian",
}

export { ByteArray, Endian };