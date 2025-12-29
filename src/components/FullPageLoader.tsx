import Loader from "./Loader";

export default function FullPageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader />
    </div>
  );
}
