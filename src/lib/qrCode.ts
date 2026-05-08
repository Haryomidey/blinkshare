const size = 21;
const dataCodewords = 19;
const ecCodewords = 7;
const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

type Matrix = boolean[][];
type Reserved = boolean[][];

const gfExp = new Array<number>(512);
const gfLog = new Array<number>(256);

let gfReady = false;

const initGf = () => {
    if (gfReady) return;

    let value = 1;
    for (let i = 0; i < 255; i += 1) {
        gfExp[i] = value;
        gfLog[value] = i;
        value <<= 1;
        if (value & 0x100) value ^= 0x11d;
    }

    for (let i = 255; i < 512; i += 1) {
        gfExp[i] = gfExp[i - 255];
    }

    gfReady = true;
};

const gfMul = (a: number, b: number) => {
    if (a === 0 || b === 0) return 0;
    return gfExp[gfLog[a] + gfLog[b]];
};

const generatorPoly = (degree: number) => {
    initGf();
    let poly = [1];

    for (let i = 0; i < degree; i += 1) {
        const next = new Array(poly.length + 1).fill(0);
        poly.forEach((coefficient, index) => {
            next[index] ^= gfMul(coefficient, gfExp[i]);
            next[index + 1] ^= coefficient;
        });
        poly = next;
    }

    return poly;
};

const errorCorrection = (data: number[]) => {
    const generator = generatorPoly(ecCodewords);
    const message = [...data, ...new Array(ecCodewords).fill(0)];

    for (let i = 0; i < data.length; i += 1) {
        const factor = message[i];
        if (factor === 0) continue;

        for (let j = 0; j < generator.length; j += 1) {
            message[i + j] ^= gfMul(generator[j], factor);
        }
    }

    return message.slice(data.length);
};

class BitBuffer {
    bits: number[] = [];

    write(value: number, length: number) {
        for (let i = length - 1; i >= 0; i -= 1) {
            this.bits.push((value >> i) & 1);
        }
    }

    toBytes() {
        const bytes: number[] = [];
        for (let i = 0; i < this.bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j += 1) {
                byte = (byte << 1) | (this.bits[i + j] ?? 0);
            }
            bytes.push(byte);
        }
        return bytes;
    }
}

const encodeAlphanumeric = (value: string) => {
    const normalized = value.toUpperCase();
    const buffer = new BitBuffer();

    buffer.write(0b0010, 4);
    buffer.write(normalized.length, 9);

    for (let i = 0; i < normalized.length; i += 2) {
        const first = alpha.indexOf(normalized[i]);
        const second = alpha.indexOf(normalized[i + 1]);
        if (first < 0) throw new Error('Unsupported QR character');

        if (second >= 0) {
            buffer.write(first * 45 + second, 11);
        } else {
            buffer.write(first, 6);
        }
    }

    const capacityBits = dataCodewords * 8;
    buffer.write(0, Math.min(4, capacityBits - buffer.bits.length));
    while (buffer.bits.length % 8 !== 0) buffer.bits.push(0);

    const bytes = buffer.toBytes();
    const pads = [0xec, 0x11];
    let padIndex = 0;
    while (bytes.length < dataCodewords) {
        bytes.push(pads[padIndex % 2]);
        padIndex += 1;
    }

    return bytes;
};

const empty = (): [Matrix, Reserved] => [
    Array.from({ length: size }, () => Array(size).fill(false)),
    Array.from({ length: size }, () => Array(size).fill(false)),
];

const setModule = (matrix: Matrix, reserved: Reserved, x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    matrix[y][x] = dark;
    reserved[y][x] = true;
};

const addFinder = (matrix: Matrix, reserved: Reserved, x: number, y: number) => {
    for (let dy = -1; dy <= 7; dy += 1) {
        for (let dx = -1; dx <= 7; dx += 1) {
            const xx = x + dx;
            const yy = y + dy;
            const inPattern = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
            const dark = inPattern && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
            setModule(matrix, reserved, xx, yy, dark);
        }
    }
};

const addFunctionPatterns = (matrix: Matrix, reserved: Reserved) => {
    addFinder(matrix, reserved, 0, 0);
    addFinder(matrix, reserved, size - 7, 0);
    addFinder(matrix, reserved, 0, size - 7);

    for (let i = 8; i < size - 8; i += 1) {
        setModule(matrix, reserved, i, 6, i % 2 === 0);
        setModule(matrix, reserved, 6, i, i % 2 === 0);
    }

    setModule(matrix, reserved, 8, size - 8, true);

    for (let i = 0; i < 9; i += 1) {
        if (i !== 6) {
            reserved[8][i] = true;
            reserved[i][8] = true;
        }
    }

    for (let i = size - 8; i < size; i += 1) {
        reserved[8][i] = true;
        reserved[i][8] = true;
    }
};

const formatBits = (mask: number) => {
    let data = (0b01 << 3) | mask;
    let bits = data << 10;
    const generator = 0b10100110111;

    for (let i = 14; i >= 10; i -= 1) {
        if ((bits >> i) & 1) bits ^= generator << (i - 10);
    }

    return (((data << 10) | bits) ^ 0b101010000010010) & 0x7fff;
};

const addFormat = (matrix: Matrix, reserved: Reserved, mask: number) => {
    const bits = formatBits(mask);
    const first = [
        [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
        [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    const second = [
        [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
        [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
    ];

    first.forEach(([x, y], index) => setModule(matrix, reserved, x, y, ((bits >> index) & 1) === 1));
    second.forEach(([x, y], index) => setModule(matrix, reserved, x, y, ((bits >> index) & 1) === 1));
};

const maskFormula = (mask: number, x: number, y: number) => {
    if (mask === 0) return (x + y) % 2 === 0;
    return false;
};

export const createQrMatrix = (value: string) => {
    const [matrix, reserved] = empty();
    addFunctionPatterns(matrix, reserved);

    const bytes = [...encodeAlphanumeric(value), ...errorCorrection(encodeAlphanumeric(value))];
    const bits = bytes.flatMap((byte) => Array.from({ length: 8 }, (_, index) => (byte >> (7 - index)) & 1));

    let bitIndex = 0;
    let upward = true;

    for (let x = size - 1; x > 0; x -= 2) {
        if (x === 6) x -= 1;

        for (let step = 0; step < size; step += 1) {
            const y = upward ? size - 1 - step : step;

            for (let dx = 0; dx < 2; dx += 1) {
                const xx = x - dx;
                if (reserved[y][xx]) continue;

                const bit = bits[bitIndex] ?? 0;
                matrix[y][xx] = Boolean(bit) !== maskFormula(0, xx, y);
                bitIndex += 1;
            }
        }

        upward = !upward;
    }

    addFormat(matrix, reserved, 0);
    return matrix;
};