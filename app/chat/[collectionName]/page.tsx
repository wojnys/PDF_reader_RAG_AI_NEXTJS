import Chat from "@/app/components/Chat";
import CollectionList from "@/app/components/CollectionList";

const ChatPage = () => {
    return (
        <div className="flex min-h-screen">
            <div className="flex-shrink-0 w-1/3 h-[100vh] px-12 bg-white shadow-md dark:bg-gray-800 ">
                <CollectionList />
            </div>
            <div className="flex-grow w-2/3">
                <Chat />
            </div>
        </div>
    );
};

export default ChatPage;
