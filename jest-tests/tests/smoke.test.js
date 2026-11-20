describe('Setup Jest', () => {
test('Jest runs tests', () => {
    expect(1 + 1).toBe(2);
});

test('Environment is Node', () => {
    expect(typeof process.version).toBe('string');
});
});