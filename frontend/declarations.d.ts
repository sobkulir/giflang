declare module "*.scss"
declare module "react-top-loading-bar"
declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }
  export = WebpackWorker;
}
