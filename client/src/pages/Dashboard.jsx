import { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spinner,
  Button,
  useDisclosure,
  List,
  ListItem,
  Badge,
  Alert,
  AlertIcon,
  Input,
  useToast,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../graphQL/queries.js";
import { UPDATE_USER } from "../graphQL/mutations.js";
import { Link as RouterLink } from "react-router-dom";
import DonationModal from "../components/common/DonationModal";

const Dashboard = () => {
  const { loading, error, data, refetch } = useQuery(QUERY_ME);
  const [updateUser] = useMutation(UPDATE_USER);
  const {
    isOpen: isDonationModalOpen,
    onOpen: onDonationModalOpen,
    onClose: onDonationModalClose,
  } = useDisclosure();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );

  if (error)
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading dashboard: {error.message}
      </Alert>
    );

  const user = data?.me || {};

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  };

  const handleSave = async () => {
    try {
      await updateUser({
        variables: {
          username: editedUser.username,
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
        },
      });
      setIsEditing(false);
      refetch();
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const recentActivity = [
    ...(user.problems || []),
    ...(user.comments || []),
    ...(user.donationTransactions || []),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.purchaseDate) -
        new Date(a.createdAt || a.purchaseDate)
    )
    .slice(0, 5);

  return (
    <Box
      p={5}
      minHeight="100vh"
      bgGradient="linear(palette.darkgrey, palette.gradpurple, palette.darkgrey)"
      color="white"
    >
      <VStack spacing={6} align="stretch">
        <Heading>My Dashboard</Heading>

        <Box
          borderWidth="1px"
          bg="palette.darkgrey"
          p={4}
          bgGradient="linear(palette.darkgrey, palette.grey)"
          boxShadow="4px 5px 10px 5px black"
          borderRadius={10}
          borderColor="palette.grey"
        >
          {isEditing ? (
            <>
              <Text color="palette.white">
                <strong>Username:</strong>
                <Input
                  name="username"
                  value={editedUser.username}
                  onChange={handleInputChange}
                  color="palette.white"
                  ml={2}
                />
              </Text>
              <Text>
                <strong>First Name:</strong>
                <Input
                  name="firstName"
                  value={editedUser.firstName}
                  onChange={handleInputChange}
                  color="palette.white"
                  ml={2}
                />
              </Text>
              <Text>
                <strong>Last Name:</strong>
                <Input
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleInputChange}
                  color="palette.white"
                  ml={2}
                />
              </Text>
              <Button mt={2} colorScheme="green" onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Text color="palette.white">
                <strong>Username:</strong> {user.username}
              </Text>
              <Text>
                <strong>First Name:</strong> {user.firstName}
              </Text>
              <Text>
                <strong>Last Name:</strong> {user.lastName}
              </Text>
              <Button mt={2} colorScheme="blue" onClick={handleEdit}>
                Update
              </Button>
            </>
          )}
          <Text>
            <strong>Email:</strong> {user.email}
          </Text>
          <Divider my={2} />
          <Text fontWeight="bold" mt={2}>
            Coins:
          </Text>
          <StatGroup>
            <Stat>
              <StatLabel>Coins</StatLabel>
              <StatNumber>{user.coins || 0}</StatNumber>
            </Stat>
          </StatGroup>
          <Divider my={2} />
          <Text fontWeight="bold" mt={2}>
            Donations:
          </Text>
          <Button mt={2} colorScheme="purple" onClick={onDonationModalOpen}>
            View Donations
          </Button>
          <Button
            mt={2}
            ml={2}
            colorScheme="green"
            as={RouterLink}
            to="/Donate"
          >
            Make a Donation
          </Button>
        </Box>

        <Box
          p={3}
          shadow="md"
          borderWidth="1px"
          bg="palette.darkgrey"
          bgGradient="linear(palette.darkgrey, palette.grey)"
          boxShadow="4px 5px 10px 5px black"
          borderRadius={10}
          borderColor="palette.grey"
        >
          <Tabs colorScheme="purple">
            <TabList>
              <Tab>Recent Activity</Tab>
              <Tab>My Problems</Tab>
              <Tab>My Comments</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Heading size="md" mb={2}>
                  Recent Activity
                </Heading>
                {recentActivity.length > 0 ? (
                  <List spacing={3}>
                    {recentActivity.map((item, index) => (
                      <ListItem key={index}>
                        <Text>
                          {item.title ||
                            item.content ||
                            `Donation on ${formatDate(item.purchaseDate)}`}
                          <Badge
                            ml={2}
                            colorScheme={
                              item.title
                                ? "green"
                                : item.content
                                ? "blue"
                                : "purple"
                            }
                          >
                            {item.title
                              ? "Problem"
                              : item.content
                              ? "Comment"
                              : "Donation"}
                          </Badge>
                        </Text>
                        <Text fontSize="sm" color="gray.300">
                          {formatDate(item.createdAt || item.purchaseDate)}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text>No recent activity to display.</Text>
                )}
              </TabPanel>
              <TabPanel>
                <Heading size="md" mb={2}>
                  My Problems
                </Heading>
                {user.problems && user.problems.length > 0 ? (
                  <List spacing={3}>
                    {user.problems.map((problem, index) => (
                      <ListItem key={index}>
                        <Text>{problem.title}</Text>
                        <Text fontSize="sm" color="gray.300">
                          {formatDate(problem.createdAt)}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text>No problems created yet.</Text>
                )}
              </TabPanel>
              <TabPanel>
                <Heading size="md" mb={2}>
                  My Comments
                </Heading>
                {user.comments && user.comments.length > 0 ? (
                  <List spacing={3}>
                    {user.comments.map((comment, index) => (
                      <ListItem key={index}>
                        <Text>{comment.content.substring(0, 50)}...</Text>
                        <Text fontSize="sm" color="gray.300">
                          {formatDate(comment.createdAt)}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text>No comments made yet.</Text>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={onDonationModalClose}
        donations={user.donationTransactions || []}
      />
    </Box>
  );
};

export default Dashboard;
