const monitorActions = [
  'TOGGLE_ACTION', 'SWEEP', 'SET_ACTIONS_ACTIVE', 'IMPORT_STATE'
];

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
  start = () => {
    this.active = true;
    this.update();
  };
  stop = () => {
    this.active = false;
    clearTimeout(this.waitingTimeout);
  };
  isWaiting = () => {
    const currentTime = Date.now();
    if (this.lastTime && currentTime - this.lastTime < 200) {
      // no more frequently than once in 200ms
      this.stop();
      this.waitingTimeout = setTimeout(this.start, 1000);
      return true;
    }
    this.lastTime = currentTime;
    return false;
  };
  isHotReloaded = () => this.lastAction === '@@redux/INIT';
  isMonitorAction = () => monitorActions.indexOf(this.lastAction) !== -1;
  isTimeTraveling = () => this.lastAction === 'JUMP_TO_STATE';
}
