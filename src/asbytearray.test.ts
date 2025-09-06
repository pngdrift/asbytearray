import { ByteArray, Endian } from "./index";

test("Byte read/write", () => {
    const data = new ByteArray();
    data.writeByte(123);
    data.position = 0;
    const result = data.readByte();
    expect(result).toBe(123);
});

test("Unsigned Byte read/write", () => {
    const data = new ByteArray();
    data.writeByte(223);
    data.position = 0;
    const result = data.readUnsignedByte();
    expect(result).toBe(223);
});

test("Byte read/write overflow", () => {
    const data = new ByteArray();
    data.writeByte(42342);
    data.position = 0;
    const result = data.readByte();
    expect(result).toBe(102);
});

test("Boolean read/write", () => {
    const data = new ByteArray();
    data.writeBoolean(true);
    data.position = 0;
    const result = data.readBoolean();
    expect(result).toBeTruthy();
});

test("Short read/write BE", () => {
    const data = new ByteArray();
    data.writeShort(23000);
    data.position = 0;
    const result = data.readShort();
    expect(result).toBe(23000);
});

test("Short read/write LE", () => {
    const data = new ByteArray();
    data.endian = Endian.LITTLE_ENDIAN;
    data.writeShort(23000);
    data.position = 0;
    const result = data.readShort();
    expect(result).toBe(23000);
});

test("Unsigned Short read/write BE", () => {
    const data = new ByteArray();
    data.writeShort(60505);
    data.position = 0;
    const result = data.readUnsignedShort();
    expect(result).toBe(60505);
});

test("Unsigned Short read/write LE", () => {
    const data = new ByteArray();
    data.endian = Endian.LITTLE_ENDIAN;
    data.writeShort(60505);
    data.position = 0;
    const result = data.readUnsignedShort();
    expect(result).toBe(60505);
});

test("Short read/write overflow", () => {
    const data = new ByteArray();
    data.writeShort(500000);
    data.position = 0;
    const result = data.readShort();
    expect(result).toBe(-24288);
});

test("Unsigned Short read/write", () => {
    const data = new ByteArray();
    data.writeShort(60505);
    data.position = 0;
    const result = data.readUnsignedShort();
    expect(result).toBe(60505);
});

test("int read/write BE", () => {
    const data = new ByteArray();
    data.writeInt(4533041);
    data.position = 0;
    const result = data.readInt();
    expect(result).toBe(4533041);
});

test("int read/write LE", () => {
    const data = new ByteArray();
    data.endian = Endian.LITTLE_ENDIAN;
    data.writeInt(4533041);
    data.position = 0;
    const result = data.readInt();
    expect(result).toBe(4533041);
});

test("uint read/write BE", () => {
    const data = new ByteArray();
    data.writeInt(2442535);
    data.position = 0;
    const result = data.readUnsignedInt();
    expect(result).toBe(2442535);
});

test("uint read/write LE", () => {
    const data = new ByteArray();
    data.endian = Endian.LITTLE_ENDIAN;
    data.writeInt(2442535);
    data.position = 0;
    const result = data.readUnsignedInt();
    expect(result).toBe(2442535);
});

test("int read/write overflow", () => {
    const data = new ByteArray();
    data.writeInt(4_444_444_444);
    data.position = 0;
    const result = data.readInt();
    expect(result).toBe(149477148);
});

test("float read/write BE", () => {
    const data = new ByteArray();
    data.writeFloat(1324.20);
    data.position = 0;
    const result = data.readFloat();
    expect(result).toBeLessThanOrEqual(1324.20 + 0.1);
});

test("float read/write LE", () => {
    const data = new ByteArray();
    data.endian = Endian.LITTLE_ENDIAN;
    data.writeFloat(1324.20);
    data.position = 0;
    const result = data.readFloat();
    expect(result).toBeLessThanOrEqual(1324.20 + 0.1);
});

test("double read/write BE", () => {
    const data = new ByteArray();
    data.writeDouble(1242324.240);
    data.position = 0;
    const result = data.readDouble();
    expect(result).toBeLessThanOrEqual(1242324.240 + 0.1);
});

test("double read/write LE", () => {
    const data = new ByteArray();
    data.endian = Endian.LITTLE_ENDIAN;
    data.writeDouble(1242324.240);
    data.position = 0;
    const result = data.readDouble();
    expect(result).toBeLessThanOrEqual(1242324.240 + 0.1);
});

test("UTF read/write BE", () => {
    const data = new ByteArray();
    data.writeUTF("Hello world");
    data.position = 0;
    const result = data.readUTF();
    expect(result).toBe("Hello world");
});

test("UTF read/write LE", () => {
    const data = new ByteArray();
    data.writeUTF("Hello world");
    data.endian = Endian.LITTLE_ENDIAN;
    data.position = 0;
    const result = data.readUTF();
    expect(result).toBe("Hello world");
});


test("UTF write err", () => {
    const str = "a".repeat(100000);
    const data = new ByteArray();
    let result = false;
    try {
        data.writeUTF(str);
    }
    catch(e) {
        result = true;
    }
    expect(result).toBe(true);
});

test("UTF bytes read/write", () => {
    const data = new ByteArray();
    data.writeUTFBytes("@@123 lol");
    data.position = 0;
    const result = data.readUTFBytes(data.bytesAvailable);
    expect(result).toBe("@@123 lol");
});

test("bytes read", () => {
    const data = new ByteArray();
    data.writeInt(4000);
    const data2 = new ByteArray();
    data.position = 0;
    data.readBytes(data2);
    const result = data2.readInt();
    expect(result).toBe(4000);
});

test("bytes write", () => {
    const data = new ByteArray();
    data.writeInt(4000);
    const data2 = new ByteArray();
    data.position = 0;
    data2.writeBytes(data);
    data2.position = 0;
    const result = data2.readInt();
    expect(result).toBe(4000);
});

test("compress/uncompress", () => {
    const data = new ByteArray();
    data.writeUTF("100000GEGLexaaaa");
    data.compress();
    data.uncompress();
    const result = data.readUTF();
    expect(result).toBe("100000GEGLexaaaa");
});

test("length", () => {
    const data = new ByteArray(Buffer.allocUnsafe(128));
    data.length = 0;
    data.length = 4;
    const result = data.readInt();
    expect(result).toBe(0);
});

test("clear", () => {
    const data = new ByteArray(Buffer.allocUnsafe(128));
    data.clear();
    const result = data.length;
    expect(result).toBe(0);
});

test("ByteArray constructor with initial buffer", () => {
    const buffer = Buffer.from([1, 2, 3, 4]);
    const data = new ByteArray(buffer);
    expect(data.length).toBe(4);
    expect(data.readByte()).toBe(1);
    data.position += 2;
    expect(data.readByte()).toBe(4);
});

test("bytesAvailable calc", () => {
    const data = new ByteArray();
    data.writeInt(12345);
    data.writeShort(6789);
    data.position = 0;
    expect(data.bytesAvailable).toBe(6);
    data.position = 2;
    expect(data.bytesAvailable).toBe(4);
});

test("endian persistence", () => {
    const data = new ByteArray();
    data.endian = Endian.LITTLE_ENDIAN;
    data.writeInt(0x12345678);
    data.position = 0;
    expect(data.readByte()).toBe(0x78);
    expect(data.readByte()).toBe(0x56);
    expect(data.readByte()).toBe(0x34);
    expect(data.readByte()).toBe(0x12);
});

test("Write/read negative vals", () => {
    const data = new ByteArray();
    data.writeByte(-50);
    data.writeShort(-1000);
    data.writeInt(-100000);
    data.position = 0;
    expect(data.readByte()).toBe(-50);
    expect(data.readShort()).toBe(-1000);
    expect(data.readInt()).toBe(-100000);
});

test("Unsigned read of negative vals", () => {
    const data = new ByteArray();
    data.writeByte(-50);
    data.writeShort(-1000);
    data.position = 0;
    expect(data.readUnsignedByte()).toBe(206);
    expect(data.readUnsignedShort()).toBe(64536);
});

test("Length expansion fills with zeros", () => {
    const data = new ByteArray();
    data.writeInt(4305672);
    data.length = 8;
    data.position = 4;
    expect(data.readInt()).toBe(0);
});

test("Write/read maximum values", () => {
    const data = new ByteArray();
    data.writeByte(255);
    data.writeShort(65535);
    data.writeInt(4294967295);
    data.position = 0;
    expect(data.readUnsignedByte()).toBe(255);
    expect(data.readUnsignedShort()).toBe(65535);
    expect(data.readUnsignedInt()).toBe(4294967295);
});

test("Write/read minimum values", () => {
    const data = new ByteArray();
    data.writeByte(-128);
    data.writeShort(-32768);
    data.writeInt(-2147483648);
    data.position = 0;
    expect(data.readByte()).toBe(-128);
    expect(data.readShort()).toBe(-32768);
    expect(data.readInt()).toBe(-2147483648);
});
