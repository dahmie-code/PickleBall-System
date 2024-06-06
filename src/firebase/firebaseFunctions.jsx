// import necessary dependencies
import { auth, db } from "./Firebase";
import { ref, get, push, set, update, remove, orderByChild, equalTo, query, } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

/*
-------------------------  CLUB-RELATED FUNCTIONS  ---------------------------------
*/

// Define a reference to the 'clubs' collection in the database
const clubsRef = ref(db, "Clubs");
/**
 * Fetches all club data from Firebase and returns it as an array of objects.
 */
const getAllClubs = async () => {
  try {
    const snapshot = await get(clubsRef);
    if (snapshot.exists()) {
      // Return the data if it exists
        console.log(snapshot.val());
      return snapshot.val();
    } else {
      // Throw an error if no clubs are found
      throw new Error("No clubs found in the database.");
    }
  } catch (error) {
    console.error("Error getting clubs data:", error);
    // Rethrow the error for handling at a higher level
    throw error;
  }
};

// Functions to get club IDs from Firebase
const getClubIds = async () => {
  const clubsRef = ref(db, "Clubs");

  try {
    const snapshot = await get(clubsRef);
    if (snapshot.exists()) {
      const clubIds = [];
      snapshot.forEach((childSnapshot) => {
        const clubId = childSnapshot.key;
        // Push each club ID into the array
        clubIds.push(clubId);
      });
      // Return the array of club IDs
      return clubIds;
    } else {
      // Throw an error if no clubs are found
      throw new Error("No clubs found in the database.");
    }
  } catch (error) {
    console.error("Error getting club IDs:", error);
    // Rethrow the error for handling at a higher level
    throw error;
  }
};

/**
 * Gets a specific club's information by its ID. Returns null if not found.
 **/
const getClub = async (clubId) => {

  const clubRef = ref(db, `Clubs/${clubId}`);

  try {
    const snapshot = await get(clubRef);
    if (snapshot.exists()) {
      // Return the data if it exists
      return snapshot.val();
    } else {
      // Throw an error if the club does not exist
      throw new Error(`Club with ID ${clubId} does not exist.`);
    }
  } catch (error) {
    console.error(`Error getting club with ID ${clubId}:`, error);
    //   Rethrow the error for handling at a higher level
    throw error;
  }
};

const joinClub = async (clubId, userId) => {
  const clubRef = ref(db, `Clubs/${clubId}`);
  try {
    const snapshot = await get(clubRef);
    if (snapshot.child(`members/${userId}`).exists()) {
      console.log("User is already a member for this club");
      return;
    }

    // Check if the user already has a pending membership request
    const currentMembershipRequests =
      snapshot.child("membershipRequests").val() || [];
    const existingRequest = currentMembershipRequests.find(
      (request) => request.id === userId
    );

    if (existingRequest && existingRequest.status === "pending") {
      console.log(
        "User already has a pending membership request for this club"
      );
      // Notify the user that they already have a pending request
      console.log(
        userId,
        "You already have a pending membership request for this club."
      );
      return;
    }

    // Add a new membership request to the array
    const newMembershipRequest = {
      id: userId,
      status: "pending",
      reasonForRejection: "",
    };
    const updatedMembershipRequests = [
      ...currentMembershipRequests,
      newMembershipRequest,
    ];

    // Update the club with the modified membership requests array
    await update(clubRef, {
      membershipRequests: updatedMembershipRequests,
    });

    console.log(`Membership request added to club with ID: ${clubId}`);

    // Send notification to the user
    console.log(
      userId,
      "Your membership request has been submitted and is pending approval."
    );
  } catch (error) {
    console.error("Error adding membership request:", error);
    throw error;
  }
};

const approveMembershipRequest = async (clubId, userId) => {
  const clubRef = ref(db, `Clubs/${clubId}`);

  try {
    // Retrieve all data for this club
    const snapshot = await get(clubRef);
    const clubData = snapshot.val();

    // Check if the club has any membership requests
    const membershipRequests = clubData.membershipRequests || {};

    // Find the membership request for the specified user
    const membershipRequestKey = Object.keys(membershipRequests).find(
      (key) => membershipRequests[key].id === userId
    );

    // Check if the membership request exists
    if (membershipRequestKey) {
      console.log(
        "Membership request found:",
        membershipRequests[membershipRequestKey]
      );

      // Access the user-specific ID directly from the membership request
      const userSpecificId = membershipRequests[membershipRequestKey].id;
      console.log("User-specific ID:", userSpecificId);

      // Construct the userMembershipRef using the correct path
      const userMembershipRef = ref(
        db,
        `Clubs/${clubId}/membershipRequests/${membershipRequestKey}`
      );

      // Update the membership request status to 'confirmed'
      await update(userMembershipRef, { status: "approved" });

      console.log("Membership approved!");
    } else {
      console.log(`Membership request for user with ID ${userId} not found`);
      console.log("Membership requests:", membershipRequests);
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const moveToMembers = async (clubId, userId) => {
  const clubRef = ref(db, `Clubs/${clubId}`);
  try {
    // Retrieve all data for this club
    const snapshot = await get(clubRef);
    const clubData = snapshot.val();

    // Move the approved member to the 'members' section
    const membersRef = ref(db, `Clubs/${clubId}/members`);
    const membersCount = Object.keys(clubData.members || {}).length;
    const newMemberKey = `${membersCount + 1}`;

    await update(membersRef, { [newMemberKey]: userId });

    console.log("Member moved to members!");
  } catch (error) {
    console.error("Error moving member to members:", error);
    throw error;
  }
};

const removeMembershipRequest = async (clubId, userId) => {
  const clubRef = ref(db, `Clubs/${clubId}`);
  try {
    // Retrieve all data for this club
    const snapshot = await get(clubRef);
    const clubData = snapshot.val();

    // Check if the club has any membership requests
    const membershipRequests = clubData.membershipRequests || {};

    // Find the membership request key for the specified user
    const membershipRequestKey = Object.keys(membershipRequests).find(
      (key) => membershipRequests[key].id === userId
    );

    // Check if the membership request key exists
    if (membershipRequestKey) {
      // Construct the userMembershipRef using the correct path
      const userMembershipRef = ref(
        db,
        `Clubs/${clubId}/membershipRequests/${membershipRequestKey}`
      );

      // Remove the user from membershipRequests
      await remove(userMembershipRef);

      console.log("User removed from membershipRequests!");
    } else {
      console.log(`Membership request for user with ID ${userId} not found`);
      console.log("Membership requests:", membershipRequests);
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const leaveClub = async (clubId, userId) => {
  try {
    const clubRef = ref(db, `Clubs/${clubId}/members/${userId}`);

    // Check if the user is a member before attempting to leave
    const snapshot = await get(clubRef);
    if (!snapshot.exists()) {
      console.log("User is not a member of this club");
      return;
    }
    // Remove the user from the club members
    await remove(clubRef);
    console.log(`User with ID ${userId} left club with ID ${clubId}`);
  } catch (error) {
    console.error("Error leaving club:", error);
    throw error;
  }
};

/**
 * Creates a new club and saves it in the Firebase Realtime Database.
 * @param {Object} clubData - The data for the new club.
 * @returns {Object} - An object with success status and a message.
 */
const createClub = async (clubData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const newClubRef = push(clubsRef);
    const newClubId = newClubRef.key;

    // Use the Firebase Authentication UID as the organizer's ID
    const organizerEmails = [user.email, ...clubData.organizers.map((email) => email)];
    var invalidOrganizerEmails = [];
    var validOrganizerEmails = [];
    var validOrganizerIds = [];

    console.log('Organizer emails:', organizerEmails);

    // Ensure that all organizers are registered users
    for (const email of organizerEmails) {
      try {
        const exists = await checkUserExistsByEmail(email);
        if (exists) {
          validOrganizerEmails.push(email);
        } else {
          invalidOrganizerEmails.push(email);
        }
      } catch (err) {
        console.error("Error checking user existence:", err);
        return {
          success: false,
          message: "Error checking user existence",
        };
      }
    }

    for (const email of validOrganizerEmails) {
      try {
        const id = await findUserIdByEmail(email);
        validOrganizerIds.push(id);
      } catch (err) {
        console.error("Error finding user ID:", err);
        return {
          success: false,
          message: "Error finding user ID",
        };
      }
    }

    // Check if validOrganizerIds is empty or null
    if (!validOrganizerIds || validOrganizerIds.length === 0) {
      console.error("No valid organizers found");
      return {
        success: false,
        message: "No valid organizers found",
      };
    }

    // Set the club data
    await set(newClubRef, {
      ...clubData,
      id: newClubId,
      organizers: validOrganizerIds,
    });

    console.log(`Club with ID ${newClubId} created successfully`);
    if (invalidOrganizerEmails.length !== 0) {
      return {
        success: true,
        message: `Club with ID ${newClubId} created successfully. The following organizers were not registered: ${invalidOrganizerEmails} as they do not have an APPRS account.`,
      }
    }else{
      return {
      success: true,
      message: `Club with ID ${newClubId} created successfully`,
    };
  }
  } catch (error) {
    console.error("Error creating club:", error);
    throw error;
  }
};

const getUserClubId = async (userId) => {
  const clubsRef = ref(db, 'Clubs');
  try {
    const snapshot = await get(clubsRef);

    if (snapshot.exists()) {
      // Loop through each club to find the one where the user is an organizer
      for (const clubId in snapshot.val()) {
        const clubData = snapshot.val()[clubId];

        if (clubData.organizers && clubData.organizers.includes(userId)) {
          // If the user is an organizer in the club, return the club details
          return {
            clubId,
            name: clubData.name,
            email: clubData.email,
          };
        }
      }

      // If the loop completes and no club is found, the user is not an organizer in any club
      return { clubId: undefined, name: undefined, email: undefined };
    } else {
      throw new Error('No clubs found in the database.');
    }
  } catch (error) {
    console.error('Error getting user club ID:', error);
    throw error;
  }
};


// Function to check if the user is an organizer
const isUserOrganizer = async (userId, clubId) => {
  const clubRef = ref(db, `Clubs/${clubId}`);
  try {
    const clubSnapshot = await get(clubRef);
    const clubData = clubSnapshot.val();

    // Check if the user ID is in the list of organizers
    if (clubData && clubData.organizers) {
      const isOrganizer = clubData.organizers.includes(userId);
      return isOrganizer;
    }

    // If the club data or organizers list is not available, return false
    return false;
  } catch (error) {
    console.error('Error checking if the user is an organizer:', error);
    throw error;
  }
};

const getAllClubMembers = async (clubId) => {
  try {
    // Check if clubId is undefined
    if (!clubId) {
      throw new Error('Club ID is undefined.');
    }

    const membersRef = ref(db, `Clubs/${clubId}/members`);
    const snapshot = await get(membersRef);

    if (snapshot.exists()) {
      // Get the IDs of club members
      const memberIds = Object.values(snapshot.val());

      // Fetch details of each club member from the players node
      const clubMembersDetails = await Promise.all(
        memberIds.map(async (memberId) => {
          const memberDetailsRef = ref(db, `players/${memberId}`);
          const memberDetailsSnapshot = await get(memberDetailsRef);

          if (memberDetailsSnapshot.exists()) {
            // Return the details of the club member
            return memberDetailsSnapshot.val();
          } else {
            console.warn(`No details found for player ID ${memberId}.`);
            return null;
          }
        })
      );

      // Filter out any potential null values (if details were not found for some IDs)
      return clubMembersDetails.filter((memberDetails) => memberDetails !== null);
    } else {
      throw new Error(`No club members found for club ID ${clubId}.`);
    }
  } catch (error) {
    console.error('Error getting club members details:', error);
    throw error;
  }
};


// Function to get organizer names
const getOrganizerNames = async (clubId) => {
  try {
    if (!clubId) {
      throw new Error('Club ID is undefined.');
    }

    const clubRef = ref(db, `Clubs/${clubId}`);
    const snapshot = await get(clubRef);

    if (snapshot.exists()) {
      const organizersIds = snapshot.val().organizers || [];
      const organizersPromises = organizersIds.map(async (organizerId) => {
        const organizer = await getUser(organizerId);
        return {
          id: organizer.id,
          name: organizer.name,
        };
      });

      const organizerData = await Promise.all(organizersPromises);
      return organizerData;
    } else {
      throw new Error(`No club found for club ID ${clubId}.`);
    }
  } catch (error) {
    console.error('Error getting organizer names:', error);
    throw error;
  }
};

/*
-------------------------  MATCH-RELATED FUNCTIONS  ---------------------------------
*/
// Function to get match details for a specific match by its match ID
async function getMatchDetails(matchId) {
  const matchRef = ref(db, `matches/${matchId}`);
  const matchSnapshot = await get(matchRef);
  return matchSnapshot.val();
}

const matchesRef = ref(db, "matches");
// Function to add match
const addMatch = async (matchData) => {
  try {
    const newMatchRef = push(matchesRef);
    await set(newMatchRef, matchData);
    console.log("Match added successfully!");
    return newMatchRef.key;
  } catch (error) {
    console.error("Error adding match:", error);
    throw error;
  }
};

// Function to update match
const updateMatch = async (matchId, matchData) => {
  try {
    const matchRef = ref(db, `matches/${matchId}`);
    await update(matchRef, matchData);
    console.log(`Match with ID ${matchId} updated successfully!`);
  } catch (error) {
    console.error(`Error updating match with ID ${matchId}:`, error);
    throw error;
  }
};

/*
-------------------------  USER-RELATED FUNCTIONS  ---------------------------------
*/
//Function to get a specific user age using their DOB
const calculateUserAge = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const currentDate = new Date();

  let age = currentDate.getFullYear() - birthDate.getFullYear();

  // Adjust age if birthday hasn't occurred yet this year
  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Function to get a specific user by their user ID
async function getUser(userId) {
  const userRef = ref(db, `/players/${userId}`);
  const userSnapshot = await get(userRef);
  return userSnapshot.val();
}

// Change the getAllUsers function in firebaseFunctions.jsx

async function getAllUsers() {
  const playersRef = ref(db, "/players");
  const playersSnapshot = await get(playersRef);

  if (playersSnapshot.exists()) {
    // Check if the snapshot has children
    const users = [];
    playersSnapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      users.push(user);
    });
    return users;
  } else {
    // Return an empty array if no users are found
    return [];
  }
}

async function checkUserExistsByEmail(email) {
  try {
    // Attempt to create a user with the provided email
    await createUserWithEmailAndPassword(auth, email, 'temporary-password');

    // If successful, user with the email doesn't exist
    console.log(`User with email ${email} does not exist.`);
    return false;
  } catch (error) {
    // Check if the error is due to the email already being in use
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User with email ${email} exists!`);
      return true;
    } else {
      console.error('Error checking email existence:', error.message, error.code);
      throw error;
    }
  }
}

async function findUserIdByEmail(emailToFind) {
  try {
    const playersRef = ref(db, "/players");

    const q = query(playersRef, orderByChild("email"), equalTo(emailToFind));
    const snapshot = await get(q);

    if (snapshot.exists()) {
      // User with the given email exists
      const userId = Object.keys(snapshot.val())[0];
      console.log(`User ID for email ${emailToFind}: ${userId}`);
      return userId;
    } else {
      console.log(`User with email ${emailToFind} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error finding user:", error.message);
    throw error;
  }
}



// Function to get match history for a specific user by their user ID
async function getMatchHistoryForUser(userId) {
  const matchHistoryRef = ref(db, `/players/${userId}/match_history`);
  const matchHistorySnapshot = await get(matchHistoryRef);
  return matchHistorySnapshot.val() || [];
}

// Function to update a user's data by their user ID
async function updateUser(userId, userData) {
  const userRef = ref(db, `/players/${userId}`);
  await update(userRef, userData);
}

const updateVerificationStatus = async (matchId, userId) => {
  try {
    const matchRef = ref(db, `matches/${matchId}`);
    await update(matchRef, { verified: true });
  } catch (error) {
    throw new Error("Error updating verification status: " + error.message);
  }
};

// Create User
async function createUser(email, password) {
  const auth = getAuth();

  try {
    // Create a new user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // User created successfully
    const user = userCredential.user;
    console.log(`User with email ${user.email} created successfully`);

    // Send email verification
    if (!user.emailVerified) {
      await sendEmailVerification(user);
      console.log(`Verification email sent to ${user.email}`);
    } else {
      console.log(`${user.email} is already verified.`);
    }

    return user;
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw error;
  }
}

// Function to sign out the current user
async function signOutUser() {
  const auth = getAuth();
  try {
    // Sign out the current user
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out user:", error);
    throw error;
  }
}

export {
  getAllClubs,
  getClubIds,
  getClub,
  joinClub,
  approveMembershipRequest,
  moveToMembers,
  removeMembershipRequest,
  leaveClub,
  createClub,
  getUserClubId,
  getOrganizerNames,
  isUserOrganizer,
  getAllClubMembers,
  addMatch,
  getMatchDetails,
  updateMatch,
  calculateUserAge,
  createUser,
  getAllUsers,
  getUser,
  getMatchHistoryForUser,
  updateUser,
  signOutUser,
  updateVerificationStatus,
};
