import { useQuery } from "@tanstack/react-query";
import RightPanel from "../../components/common/RightPanel";


const FollowModal = ({ type, username, onClose }) => {
  return (

    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-start z-50">
      <div className="bg-[#16181C] rounded-md w-[400px] max-h-[90vh] overflow-y-auto mt-10 relative">

        {/* Reuse RightPanel */}
        <RightPanel type={type} username={username} isModal />
      </div>
    </div>
  );
};

export default FollowModal;
