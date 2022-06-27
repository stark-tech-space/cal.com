import classNames from "@calcom/lib/classNames";

type SkeletonBaseProps = {
  width: string;
  height: string;
  className?: string;
};

interface AvatarProps extends SkeletonBaseProps {
  // Limit this cause we don't use avatars bigger than thi
  width: "2" | "3" | "4" | "5" | "6" | "8" | "12";
  height: "2" | "3" | "4" | "5" | "6" | "8" | "12";
}

interface SkeletonContainer {
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  className?: string;
}

const SkeletonAvatar: React.FC<AvatarProps> = ({ width, height }) => {
  return (
    <div className={`mt-1 rounded-full bg-gray-200 ltr:mr-2 rtl:ml-2 w-${width} h-${height} ${classNames}`} />
  );
};

const SkeletonText: React.FC<SkeletonBaseProps> = ({ width, height }) => {
  return <div className={classNames(`rounded-md bg-gray-200  w-${width} h-${height}`, classNames)} />;
};

const SkeletonButton: React.FC<SkeletonBaseProps> = ({ width, height }) => {
  return (
    <SkeletonContainer>
      <div className={`w-${width} h-${height} bg-gray-200 ${classNames}`} />
    </SkeletonContainer>
  );
};

const SkeletonContainer: React.FC<SkeletonContainer> = ({ children, as, className }) => {
  const Component = as || "div";
  return <Component className={classNames("animate-pulse", className)}>{children}</Component>;
};

export { SkeletonAvatar, SkeletonText, SkeletonButton, SkeletonContainer };
