/** Textos didáticos dos componentes e do modo "Como funciona?". */

export const PARTS = {
  vento: {
    titulo: 'Vento',
    resumo: 'O ar em movimento carrega energia cinética.',
    texto:
      'O vento é ar em movimento. Quanto mais rápido ele sopra, mais energia carrega: a potência do vento cresce com o CUBO da velocidade. Dobrar a velocidade multiplica a energia disponível por 8!',
  },
  pas: {
    titulo: 'Pás Savonius',
    resumo: 'Conchas curvas que “seguram” o vento.',
    texto:
      'As pás têm formato de meio-cilindro. O lado côncavo (a “concha”) segura muito mais o vento do que o lado convexo (arredondado), que o desvia. Essa diferença de força de arrasto cria um torque que faz o rotor girar — venha o vento de qualquer direção.',
  },
  eixo: {
    titulo: 'Eixo vertical',
    resumo: 'Transmite o giro das pás até a base.',
    texto:
      'O eixo é preso às pás pelos discos de fixação. Ele gira junto com o rotor e leva o movimento (energia mecânica) até a base, onde ficam as engrenagens e o gerador. Por ser vertical, o gerador pode ficar perto do chão.',
  },
  transmissao: {
    titulo: 'Transmissão (engrenagens)',
    resumo: 'Multiplica a rotação para o gerador.',
    texto:
      'A engrenagem grande, presa ao eixo, move uma engrenagem 3 vezes menor ligada ao gerador. Assim o gerador gira 3× mais rápido que o rotor — geradores funcionam melhor em rotações mais altas.',
  },
  gerador: {
    titulo: 'Gerador',
    resumo: 'Transforma movimento em eletricidade.',
    texto:
      'Dentro do gerador, ímãs giram perto de bobinas de fio de cobre. A variação do campo magnético movimenta os elétrons do fio (indução eletromagnética, descoberta por Faraday) e surge corrente elétrica. Ative o “Raio-X” para ver os ímãs e as bobinas.',
  },
  cabos: {
    titulo: 'Cabos elétricos',
    resumo: 'Levam a corrente até a lâmpada.',
    texto:
      'Os fios de cobre conduzem a corrente do gerador até a lâmpada, formando um circuito fechado (um fio de ida e um de volta). As partículas luminosas representam a energia fluindo: mais rotação, mais fluxo.',
  },
  lampada: {
    titulo: 'Lâmpada',
    resumo: 'Converte energia elétrica em luz.',
    texto:
      'Quando a corrente passa pela lâmpada, ela transforma energia elétrica em luz (e um pouco de calor). Com o rotor parado não há corrente e ela fica apagada; quanto mais rápido o rotor gira, mais forte ela brilha.',
  },
  base: {
    titulo: 'Base e estrutura',
    resumo: 'Sustenta e mantém tudo alinhado.',
    texto:
      'A base e as colunas mantêm a turbina firme e o eixo alinhado. Os rolamentos (anéis dourados no topo e na base) deixam o eixo girar com pouco atrito.',
  },
};

/** Ordem das peças no modo "Explorar estrutura". */
export const PART_ORDER = ['pas', 'eixo', 'transmissao', 'gerador', 'cabos', 'lampada', 'base'];

/** Passos do modo "Como funciona?". */
export const TOUR = [
  {
    id: 'vento',
    curto: 'Vento',
    titulo: 'Entrada do vento',
    componente: 'Fluxo de ar',
    texto: 'O ar em movimento chega ao rotor carregando energia cinética. A potência disponível cresce com o cubo da velocidade: P = ½·ρ·A·v³. Por enquanto a turbina está travada.',
  },
  {
    id: 'pas',
    curto: 'Pás',
    titulo: 'Rotação das pás',
    componente: 'Pás Savonius',
    texto: 'O lado côncavo da pá retém o ar e sofre mais arrasto que o lado convexo, que o desvia. A diferença entre as duas forças gera torque e o rotor começa a girar, acelerando aos poucos por causa da inércia.',
  },
  {
    id: 'eixo',
    curto: 'Transmissão',
    titulo: 'Transmissão mecânica',
    componente: 'Eixo e engrenagens',
    texto: 'O eixo vertical gira com o rotor e leva a energia mecânica até a base. A engrenagem grande move uma engrenagem 3 vezes menor: o gerador gira 3× mais rápido que as pás.',
  },
  {
    id: 'gerador',
    curto: 'Gerador',
    titulo: 'Geração de energia',
    componente: 'Gerador',
    texto: 'Dentro do gerador, ímãs giram diante de bobinas de cobre. A variação do campo magnético induz corrente elétrica nos fios (Lei de Faraday): a energia mecânica vira energia elétrica.',
  },
  {
    id: 'lampada',
    curto: 'Lâmpada',
    titulo: 'Iluminação da lâmpada',
    componente: 'Cabos e lâmpada',
    texto: 'A corrente percorre o circuito fechado formado pelos cabos e chega à lâmpada, que converte energia elétrica em luz. Mais vento → mais rotação → mais energia → mais brilho.',
  },
];
