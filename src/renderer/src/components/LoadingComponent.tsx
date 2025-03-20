function LoadingComponent(): JSX.Element {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <img
        src="https://cdn-nexus.vnggames.com/assets/images/common/logo-loading.gif"
        alt=""
        className="w-20"
      ></img>
    </div>
  );
}

export default LoadingComponent;
