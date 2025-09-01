import { FunctionComponent, MouseEventHandler } from "react";

interface ButtonProps {
  children: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const Button: FunctionComponent<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className="bg-gray-200 p-3 rounded cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export { Button };
