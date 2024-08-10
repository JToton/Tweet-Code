
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

const DonationModal = ({ isOpen, onClose, donations }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="palette.darkgrey">
        <ModalHeader color="palette.white">My Donations</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {donations.length > 0 ? (
            <List spacing={3}>
              {donations.map((donation, index) => (
                <ListItem key={index} color="palette.white">
                  <Text fontWeight="bold">
                    Donation on {formatDate(donation.purchaseDate)}
                  </Text>
                  {donation.donations.map((item, itemIndex) => (
                    <Text key={itemIndex} fontSize="sm">
                      {item.name}: ${item.price}
                    </Text>
                  ))}
                </ListItem>
              ))}
            </List>
          ) : (
            <Text color="palette.white">No donations to display.</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

DonationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  donations: PropTypes.arrayOf(
    PropTypes.shape({
      purchaseDate: PropTypes.string.isRequired,
      donations: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default DonationModal;
