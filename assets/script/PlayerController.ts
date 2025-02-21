import { _decorator, Component, Node, input, Input, Vec3, EventMouse, Animation, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;
export const JUMP_END = 'jumpEnd';

@ccclass('PlayerController')
export class PlayerController extends Component {
  private isJump = false;
  private curJumpTime = 0;
  private jumpTime = 0;
  private curJumpSpeed = 0;
  private curPos = new Vec3();
  private targetPos = new Vec3();
  private moveStep = 0;

  @property(Animation)
  bodyAnim: Animation = null;

  @property(Node)
  leftTouch: Node = null;

  @property(Node)
  rightTouch: Node = null;

  start() {
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  toogleInput(flag: boolean) {
    if (flag) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
      //   this.leftTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
      //   this.rightTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
      //   this.leftTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
      //   this.rightTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
  }

  update(deltaTime: number) {
    if (this.isJump) this.jumping(deltaTime);
  }
  onTouchStart(event: EventTouch) {
    let target = event.target as Node;
    this.jumpByStep(target.name === 'LeftTouch' ? 1 : 2);
  }
  onMouseUp(event: EventMouse) {
    if (this.isJump) return;
    const btnType = event.getButton();
    if (btnType === EventMouse.BUTTON_LEFT) this.jumpByStep(1);
    if (btnType === EventMouse.BUTTON_RIGHT) this.jumpByStep(2);
  }
  jumpByStep(step: 1 | 2) {
    if (this.isJump) return;
    const animName = `step_${step}`;
    const animState = this.bodyAnim.getState(animName);
    this.isJump = true;
    this.curJumpTime = 0;
    // 获取动画时长设置为跳跃时长
    this.jumpTime = animState.duration;
    // 一格距离40，根据时长计算跳跃速度
    this.curJumpSpeed = (step * BLOCK_SIZE) / this.jumpTime;
    this.node.getPosition(this.curPos);
    Vec3.add(this.targetPos, this.curPos, new Vec3(step * BLOCK_SIZE, 0, 0));
    this.bodyAnim.play(animName);
    // 记录跳跃步数
    this.moveStep += step;
  }
  jumping(time: number) {
    // 累计每帧的时长，超过动画时长表示跳跃结束
    this.curJumpTime += time;
    if (this.curJumpTime < this.jumpTime) {
      // 设置跳跃x坐标
      this.node.getPosition(this.curPos);
      this.curPos.x += this.curJumpSpeed * time;
      this.node.setPosition(this.curPos);
    } else {
      // 跳跃完成
      this.isJump = false;
      this.node.setPosition(this.targetPos);
      this.node.emit(JUMP_END, this.moveStep);
    }
  }
  reset() {
    // 重置坐标及相关参数
    this.moveStep = 0;
    this.node.setPosition(Vec3.ZERO);
    Vec3.zero(this.curPos);
    Vec3.zero(this.targetPos);
  }
}
