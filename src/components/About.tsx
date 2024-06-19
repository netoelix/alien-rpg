import { AboutStyle } from '../styles/AboutStyle';

function About() {
  return (
    <AboutStyle>
      <h1>Campanha Fragmentos de guerra</h1>
      <p>
        Esta página foi criada para registrar os acontecimentos das
        campanhas jogadas pelo meu grupo de Alien RPG. Aqui, você
        encontrará resumos das sessões, informações detalhadas
        sobre os personagens e uma linha do tempo desse universo incrível.
      </p>
      <h3>
        Seja bem vindo e lembre-se,
        <span> No espaço, ninguém pode te ouvir gritar</span>
      </h3>
      <h2>E qual é a história mãe?</h2>
      <p>
        No início de uma guerra devastadora entre a corporação
        Weyland-Yutani e o governo da UPP (União dos Povos
        Progressistas), os jogadores encontravam-se vivendo pacificamente
        no sistema de Acheron Prime. Esse sistema foi abruptamente
        envolvido no conflito, quando a UPP lançou um ataque implacável
        contra o planeta enquanto a Weyland-Yutani tentava desesperadamente
        defender seus interesses.
      </p>
      {' '}
      <p>
        Presos no fogo cruzado, os jogadores mal conseguiram escapar com vida.
        Refugiando-se em um sistema vizinho, eles chegaram a uma base científica
        da Weyland-Yutani. Lá, demonstrando bravura e habilidade, conseguiram
        salvar a base de uma sabotagem iminente. Esta vitória os levou à Terra,
        onde buscariam reforços para a base danificada.
      </p>
      {' '}
      <p>
        Ao concluir a missão, depararam-se com oficiais das Américas Unidas (AU).
        Reconhecendo a sombra ameaçadora que as megacorporações, especialmente a
        Weyland-Yutani, lançavam sobre suas vidas, os jogadores decidiram se alistar
        nas forças especiais da AU. Conhecedores de segredos comprometedores sobre
        a Weyland, sabiam que permanecer livres de vínculos corporativos era sua
        única chance de sobrevivência.
      </p>
      {' '}
      <p>
        Agora, como membros de um esquadrão especial de infiltração da AU (Wild Weasel),
        os jogadores estão prontos para enfrentar novas e perigosas aventuras.
      </p>
      <h3>Quem está embarcado?</h3>
      <ul>
        <li>
          <h4>Comtech Marine</h4>
          <p>
            <span>Nome:</span>
            {' '}
            André
          </p>
          <p>
            <span>Função:</span>
            {' '}
            Comtech Marine
          </p>
        </li>
        <li>
          <h4>Piloto</h4>
          <p>
            <span>Nome:</span>
            {' '}
            Fernando (Gelatto)
          </p>
          <p>
            <span>Função:</span>
            {' '}
            Piloto
          </p>
        </li>
        <li>
          <h4>Fuzileiro</h4>
          <p>
            <span>Nome:</span>
            {' '}
            Bruno
          </p>
          <p>
            <span>Função:</span>
            {' '}
            Fuzileiro
          </p>
        </li>
      </ul>
      <h3>Sobre Alien RPG</h3>
      <p>
        O Alien RPG é um jogo de RPG de mesa de ficção científica baseado no
        universo de
        <span> Alien,o oitavo passageiro. </span>
        O jogo foi desenvolvido
        pela Free League Publishing e foi lançado em 2019. O jogo é
        ambientado no universo de Alien, o oitavo passageiro, e é
        focado em sobrevivência e horror.
      </p>
      <p>
        Alien RPG foi localizado para o português pela editora
        {' '}
        <span>New Order</span>
        {' '}
        e pode ser adquirido atráves deste link:
        {' '}
        <a href="http://" target="_blank" rel="noopener noreferrer">https://www.newordereditora.com/</a>
      </p>
    </AboutStyle>
  );
}

export default About;
