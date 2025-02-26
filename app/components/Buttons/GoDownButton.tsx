import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface GoDownButtonProps {
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const GoDownButton: React.FC<GoDownButtonProps> = ({ inputRef }) => {
    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.scrollIntoView({ behavior: "smooth" });
            inputRef.current.focus();
        }
    };

    return (
        <div className="absolute right-1/2 bottom-20 rounded-full bg-white w-8 h-8 cursor-pointer opacity-80" onClick={handleClick}>
            <FontAwesomeIcon icon={faArrowDown} className="w-8 h-8 text-gray-500 hover:text-gray-200" />
        </div>
    );
};

export default GoDownButton;
