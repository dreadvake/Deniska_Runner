export const runner = {
    x: 35,
    y: 315,
    width: 160,
    height: 80,
    vy: 0,
    gravity: 0.3,
    jumpPower: -17
};

export function getGroundY() {
    return runner.y + runner.height;
}