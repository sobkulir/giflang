declare module "*.scss"

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }
  export = WebpackWorker;
}
