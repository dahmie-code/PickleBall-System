import { useState } from "react";
import { CloseIcon, ModalContainer, ModalContent } from "./ClubListStyles";

const Modal = ({ isOpen, onClose, membershipRequests, handleApproveMembershipRequest, handleMoveToMembers }) => {
  const [approvedRequests, setApprovedRequests] = useState([]);
    if (!isOpen) {
      return null;
  }
  
  const handleApproveClick = async (requestId) => {
    await handleApproveMembershipRequest(requestId);
    setApprovedRequests((prevApproved) => [...prevApproved, requestId]);
  };

  
    return (
      <ModalContainer className="modal">
        <ModalContent className="modal-content">
                <h3>Membership Requests</h3>
                <CloseIcon onClick={onClose}>Close</CloseIcon>
          <ul>
            {membershipRequests && membershipRequests.map((request) => (
                <li key={request.id}>
                    <div className="request-header">
                <p>{request.userDetails && request.userDetails.name} has requested to join the club.</p>
                {request.status === 'pending' && (
                    <button onClick={() => handleApproveClick(request.id)}>
                      {approvedRequests.includes(request.id) ? 'Approved' : 'Approve'}
                    </button>
                  )}
                  {request.status === 'approved' && (
                    <button onClick={() => handleMoveToMembers(request.id)} disabled>
                      Approved
                    </button>
                  )}
                    </div>
                {request.userDetails && (
                  <div key={request.id}>
                    <p>User Name: {request.userDetails.name}</p>
                    <p>Email: {request.userDetails.email}</p>
                    <p>Gender: {request.userDetails.gender}</p>
                    <p>Location: {request.userDetails.location.city}, {request.userDetails.location.state}, {request.userDetails.location.country}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>

        </ModalContent>
      </ModalContainer>
    );
  };
  
  export default Modal;
  