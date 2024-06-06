import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getClub,
  getUser,
  calculateUserAge,
  joinClub,
  approveMembershipRequest,
  moveToMembers,
  removeMembershipRequest,
} from "../firebase/firebaseFunctions";
import {
  ClubDetailsContainer,
  ClubName,
  ClubContact,
  MemberCardHeader,
  Rating,
  RatingSingles,
  RatingDoubles,
  RatingContainer,
  JoinLeaveButton,
  BackIcon,
  MemberCard,
  ClubMembers,
  MdExpandMore,
} from "./ClubListStyles";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Modal from "./RequestsModal";
import CreateMatch from "../components/createMatch/CreateMatch";

const ClubDetails = ({ userId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clubDetails, setClubDetails] = useState(null);
  const [error, setError] = useState(null);
  const [memberDetails, setMemberDetails] = useState([]);
  const [membershipRequestStatus, setMembershipRequestStatus] = useState(null);
  const [organizerDetails, setOrganizerDetails] = useState([]);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMembershipRequests, setSelectedMembershipRequests] = useState(
    []
  );
  const [joinClubClicked, setJoinClubClicked] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  // Fetch club details
  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        const details = await getClub(id);
        setClubDetails(details);
        // Fetch member details
        const members = details.members || [];
        const memberPromises = Object.values(members).map(async (memberId) => {
          const member = await getUser(memberId);
          return member;
        });

        const memberDetails = await Promise.all(memberPromises);
        setMemberDetails(memberDetails);

          // Fetch organizer details
    const organizers = details.organizers || [];
    const organizerPromises = organizers.map(async (organizerId) => {
      const organizer = await getUser(organizerId);
      return organizer;
    });

    const organizerDetails = await Promise.all(organizerPromises);
    setOrganizerDetails(organizerDetails); 
      } catch (error) {
        setError(error.message || "Error fetching club details");
        console.error("Error fetching club details:", error);
      }
    };

    fetchClubDetails();
  }, [id, userId]);

  const handleRequestJoinClub = useCallback(async () => {
    try {
      const user = getAuth().currentUser;
      const userId = user.uid;
      if (user) {
        const userDetails = await getUser(userId);
        joinClub(clubDetails.id, userId, userDetails.name, userDetails.id);
        setMembershipRequestStatus("pending");
        setJoinClubClicked(true);
      } else {
        console.error("User details not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [clubDetails]);
  const fetchUserDetails = async (userId) => {
    try {
      const userDetails = await getUser(userId);
      return userDetails;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      try {
        if (user) {
          // User is logged in
          const userId = user.uid;

          if (clubDetails && clubDetails.membershipRequests && userId) {
            const membershipRequestsArray = Object.values(
              clubDetails.membershipRequests
            );

            const requestsWithDetails = await Promise.all(
              membershipRequestsArray.map(async (request) => {
                const userDetails = await fetchUserDetails(request.id);
                return { ...request, userDetails };
              })
            );

            setMembershipRequests(requestsWithDetails);

            // Update membership request status after the requests have been fetched
            const userMembershipRequest = requestsWithDetails.find(
              (req) => req.id === userId
            );
            setMembershipRequestStatus(userMembershipRequest?.status || null);

            // Check if the user has a pending or approved membership request
            const hasUserRequestedMembership = membershipRequestsArray.some(
              (req) =>
                req.id === userId &&
                (req.status === "pending" || req.status === "approved")
            );

            // Set joinClubClicked based on whether the user has requested membership
            setJoinClubClicked(hasUserRequestedMembership);
          }
        } else {
          console.log("User not logged in.");
        }
      } catch (error) {
        console.error("Error fetching membership requests:", error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [clubDetails, setMembershipRequestStatus, setJoinClubClicked]);

  useEffect(() => {
    if (
      clubDetails &&
      Array.isArray(clubDetails.membershipRequests) &&
      clubDetails.membershipRequests.some((req) => req.id === userId)
    ) {
      const userMembershipRequest = clubDetails.membershipRequests.find(
        (req) => req.id === userId
      );
      setMembershipRequestStatus(userMembershipRequest.status);
    } else {
      setMembershipRequestStatus((prevStatus) => {
        // Only set membershipRequestStatus to 'pending' if joinClubClicked is true
        return joinClubClicked &&
          !clubDetails.isMember &&
          !prevStatus &&
          !isOrganizer
          ? "pending"
          : prevStatus;
      });
    }
  }, [clubDetails, userId, isOrganizer, joinClubClicked]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      try {
        if (user) {
          // User is logged in
          const userId = user.uid;
  
          // Fetch club details
          const details = await getClub(id);
          setClubDetails(details);
  
          // Check if the user is an organizer
          const isOrganizer = details.organizers?.includes(userId) || false;
          setIsOrganizer(isOrganizer);
  
          if (isOrganizer) {
            // If the user is an organizer, set the membership request status to 'organizer'
            setMembershipRequestStatus("organizer");
          }
        } else {
          console.log("User not logged in.");
        }
      } catch (error) {
        console.error("Error fetching club details:", error);
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, [id]);
  

  const handleBackClick = () => {
    navigate(-1);
  };

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!clubDetails) {
    return <p>Loading...</p>;
  }

  const numberOfMembers = memberDetails.length;
  const memberLabel = numberOfMembers === 1 ? "member" : "members";

  const handleMoveToMembers = async (userId) => {
    try {
      // Implement the logic to move the approved member to the 'members' section
      const user = getAuth().currentUser;
      const currentUserId = user ? user.uid : null;

      if (user && currentUserId) {
        // Move the approved member to the 'members' section
        await moveToMembers(clubDetails.id, userId);

        // Remove the user from the 'membershipRequests'
        await removeMembershipRequest(clubDetails.id, userId);

        // Update the club details after moving to members
        const updatedClubDetails = await getClub(clubDetails.id);
        setClubDetails(updatedClubDetails);

        // Reset the membershipRequestStatus
        setMembershipRequestStatus(null);

        console.log("Member moved to members!");
      } else {
        console.error("User details not found");
      }
    } catch (error) {
      console.error("Error moving member to members:", error);
    }
  };

  const handleApproveMembershipRequest = async (playerId) => {
    try {
      const user = getAuth().currentUser;
      const currentUserId = user ? user.uid : null;

      if (user && currentUserId) {
        await approveMembershipRequest(
          clubDetails.id,
          playerId || currentUserId
        );

        // Move the approved member to the 'members' section
        await handleMoveToMembers(playerId || currentUserId);

        // Update the club details after approval
        const updatedClubDetails = await getClub(clubDetails.id);
        setClubDetails(updatedClubDetails);

        // Reset the membershipRequestStatus
        setMembershipRequestStatus(null);

        console.log("Membership request approved and member moved to members!");
      } else {
        console.error("User details not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const openModal = () => {
    setSelectedMembershipRequests(membershipRequests);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleClubContact = () => {
    const clubContact = document.querySelector(".club__contact");
    if (clubContact) {
      clubContact.classList.toggle("show");
    }
  };

  const handleMemberCardClick = (memberId) => {
    // Redirect to the profile page of the clicked member
    navigate(`/players/profile/${memberId}`);
  };

  const renderJoinClubButton = () => {
    if (membershipRequestStatus === "pending") {
      return <p>Membership Status: {membershipRequestStatus}</p>;
    }

    if (membershipRequestStatus === "rejected") {
      return <p>Membership Status: {membershipRequestStatus}</p>;
    }

    if (membershipRequestStatus === "approved") {
      return <p>Membership Status:{membershipRequestStatus}</p>;
    }

    // If the user is neither an organizer nor a member, and has not requested to join
    if (
      clubDetails &&
      !clubDetails.isMember &&
      !isOrganizer &&
      !joinClubClicked
    ) {
      return (
        <JoinLeaveButton onClick={handleRequestJoinClub}>
          Join Club
        </JoinLeaveButton>
      );
    }

    // If the user has requested to join but the request is not yet approved
    if (
      clubDetails &&
      !clubDetails.isMember &&
      !isOrganizer &&
      joinClubClicked
    ) {
      return (
        <JoinLeaveButton disabled>Membership Request Sent</JoinLeaveButton>
      );
    }

    // If the user is already a member
    if (clubDetails && clubDetails.isMember) {
      return <JoinLeaveButton disabled>Already a Member</JoinLeaveButton>;
    }

    return null;
  };

  const handleCreateMatchClick = () => {
    navigate("/createMatch", { state: { isLaunchedByOrganizer: isOrganizer } });
    setShowCreateMatch(true);
  };

  return (
    <ClubDetailsContainer>
      <div className="club-details__header">
        <BackIcon onClick={handleBackClick} />
        <h2>Club Details</h2>
      </div>
      <ClubName>
        <div>
          <p> {clubDetails.name}</p>
          <small>{clubDetails.city}</small>
        </div>

        <div>
          {renderJoinClubButton()}
          {/* Display a button to approve membership requests for organizers */}
          {isOrganizer &&
            clubDetails.membershipRequests &&
            Object.keys(clubDetails.membershipRequests).some(
              (key) => clubDetails.membershipRequests[key].status === "pending"
            ) && (
              <button onClick={openModal}>Approve Membership Requests</button>
            )}

          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            membershipRequests={selectedMembershipRequests}
            handleApproveMembershipRequest={handleApproveMembershipRequest}
            handleMoveToMembers={handleMoveToMembers}
          />
        </div>
      </ClubName>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>
            {numberOfMembers} {memberLabel}
          </h3>
          {isOrganizer && !showCreateMatch && (
            <button onClick={handleCreateMatchClick}>Create Match</button>
          )}
        </div>
        {showCreateMatch && <CreateMatch isLaunchedByOrganizer={true} />}
      </div>

      <ClubContact>
        <ClubMembers>
          <ul>
            {memberDetails.map((member) => (
              <MemberCard
                key={member.id}
                onClick={() => handleMemberCardClick(member.id)}
              >
                <MemberCardHeader>
                  <div>
                    <p>{member.name}</p>
                    <div className="member__details">
                      <small>
                        {member.location.city}, {member.location.state},{" "}
                        {member.location.country}{" "}
                      </small>
                      <p>
                        {" "}
                        {calculateUserAge(member.dateOfBirth)}{" "}
                        <span>{member.gender === "male" ? "M" : "F"}</span>
                      </p>
                    </div>
                  </div>
                  <Rating>
                    <RatingContainer>
                      <RatingSingles />{" "}
                      {member.rating && member.rating.singles
                        ? member.rating.singles.toFixed(2)
                        : "NR"}
                    </RatingContainer>
                    <RatingContainer>
                      <RatingDoubles />{" "}
                      {member.rating && member.rating.doubles
                        ? member.rating.doubles.toFixed(2)
                        : "NR"}
                    </RatingContainer>
                  </Rating>
                </MemberCardHeader>
              </MemberCard>
            ))}
          </ul>
        </ClubMembers>
        <div className="club__contact">
          <h3>Club Contact</h3>
          <div className="club__contact-Info">
            <p>{clubDetails.contactInfo.email} </p>
            <span>{clubDetails.contactInfo.phone} </span>
          </div>
{/* Display organizers */}
<h3>Organizers</h3>
{organizerDetails !== null && organizerDetails !== undefined && (
  <ul>
    {organizerDetails.map((organizer) => (
      <li key={organizer?.id}>
        {organizer !== null && organizer !== undefined && (
          <>
            <h4>{organizer?.name}</h4>
            <small>{organizer?.email}</small>
          </>
        )}
      </li>
    ))}
  </ul>
)}

        </div>
        <div className="club__contact-toggle">
          <MdExpandMore onClick={toggleClubContact} />
        </div>
      </ClubContact>
    </ClubDetailsContainer>
  );
};

export default ClubDetails;
