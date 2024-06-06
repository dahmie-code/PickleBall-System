import {ModalContainer, Card, SuccessIcon, CloseButton} from './css/StyledComponent'

const ModalCard = ({ message, onClose }) => {
    return (
      <ModalContainer>
        <Card>
          <p>{message}</p>
          <SuccessIcon />
          <CloseButton onClick={onClose}>Close</CloseButton>
        </Card>
      </ModalContainer>
    );
  };
  
  export default ModalCard;