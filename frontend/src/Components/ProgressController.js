export const progressController = {
  start: () => {},
  stop: () => {},
};

export const registerProgressController = (startFn, stopFn) => {
  progressController.start = startFn;
  progressController.stop = stopFn;
};
