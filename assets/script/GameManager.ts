import { _decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController, JUMP_END } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_STONE,
}

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Prefab)
  boxPrefab: Prefab = null;

  @property(CCInteger)
  roadLength = 100;

  private roadList: BlockType[] = [];

  @property(Node)
  startMenu: Node = null;

  @property(PlayerController)
  playerController: PlayerController = null;

  @property(Label)
  stepLabel: Label = null;

  start() {
    this.init();
    this.playerController.node.on(JUMP_END, this.onPlayerJumpEnd, this);
  }
  init() {
    this.startMenu.active = true;
    this.playerController.toogleInput(false);
    this.playerController.reset();
    this.generateRoad();
  }
  playing() {
    this.startMenu.active = false;
    this.stepLabel.string = '0';
    Promise.resolve().then(() => this.playerController.toogleInput(true));
  }
  generateRoad() {
    this.node.removeAllChildren();
    this.roadList.push(BlockType.BT_STONE);
    for (let i = 1; i < this.roadLength; i++) {
      if (this.roadList[i - 1] === BlockType.BT_NONE) {
        this.roadList.push(BlockType.BT_STONE);
      } else {
        this.roadList.push(Math.floor(Math.random() * 2));
      }
    }
    this.roadList.forEach((item, index) => {
      if (item === BlockType.BT_NONE) return;
      const road = instantiate(this.boxPrefab);
      this.node.addChild(road);
      road.setPosition(index * BLOCK_SIZE, 0);
    });
  }
  onPlayerJumpEnd(index: number) {
    this.stepLabel.string = (index <= this.roadLength ? index : this.roadLength).toString();
    // 掉坑里
    if (this.roadList[index] === BlockType.BT_NONE) {
      this.init();
      return;
    }
    // 跳跃完成所有路程
    if (index >= this.roadLength) {
      this.init();
    }
  }
}
