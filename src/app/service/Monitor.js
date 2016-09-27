export default class Monitor {
  constructor(update) {
    this.update = update;
  }
  reducer = (state = {}, action) => {
    if (!this.active) return state;
    this.lastAction = action.type;
    if (this.isHotReloaded()) {
      // Send new lifted state on hot-reloading
      setTimeout(this.update, 0);
    }
    return state;
  };
  start = (skipUpdate) => {
    this.active = true;
    if (!skipUpdate) this.update();
  };
  stop = () => {
    this.active = false;
    clearTimeout(this.waitingTimeout);
  };
  isHotReloaded = () => this.lastAction === '@@redux/INIT';
  isMonitorAction = () => this.lastAction && this.lastAction !== 'PERFORM_ACTION';
  isTimeTraveling = () => this.lastAction === 'JUMP_TO_STATE';
}
