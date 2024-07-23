import { ButtonTopStyle } from '../styles/ButtonTopStyle';

function ButtonTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <ButtonTopStyle
      onClick={ scrollToTop }
    >
      Ir para o topo
    </ButtonTopStyle>
  );
}

export default ButtonTop;
