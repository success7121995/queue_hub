import { FeatureSidenav } from "@/components";

const FeatureLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col md:flex-row mt-15">
      <FeatureSidenav />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default FeatureLayout;