import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, ImageBackground, TouchableOpacity, Linking, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EstruturaCurricularScreen: React.FC = () => {
  const [isRegimentoOpen, setRegimentoOpen] = React.useState(false);
  const [isCartilhaOpen, setCartilhaOpen] = React.useState(false);
  const [isCurricularSimplificadaOpen, setCurricularSimplificadaOpen] = React.useState(false);



  // Informações gerais do curso (Grade antiga)
  const cursoInfoAntiga = [
    'Curso: [100930-0] Enfermagem - Bacharelado e Licenciatura',
    'Matriz Curricular: 2015.1 [Válida para ingressantes a partir de 2014.1]',
    'Campus/Cidade: Campus Central - Mossoró',
    'Faculdade: Faculdade de Enfermagem - FAEN',
    'Obrigatórias: 4455 horas',
    'Optativas: 120 horas',
    'Ativ. Complementares: 200 horas',
    'Total a integralizar: 4775 horas',
    'Eletivas: 240 horas',
  ];

  // Dados da estrutura curricular (Grade antiga)
  const disciplinasAntiga = [
    {
      title: '1º Semestre', data: [
        { codigo: '0501001-1', nome: 'A Universidade e a Produção da Força de Trabalho em Enfermagem', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501031-1', nome: 'Biologia', ch: '75', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501002-1', nome: 'Concepções sobre o Ato de Estudar', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0301113-1', nome: 'Fundamentos da Psicologia', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0701006-1', nome: 'Fundamentos da Sociologia', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0702090-1', nome: 'Fundamentos de Filosofia', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0401089-1', nome: 'Língua Brasileira de Sinais', ch: '60', aplicacao: 'Teórica', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '2º Semestre', data: [
        { codigo: '0501025-1', nome: 'Antropologia e Saúde', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501003-1', nome: 'História e Processo de Trabalho em Enfermagem', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501026-1', nome: 'Morfologia', ch: '105', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501027-1', nome: 'Processos Fisiológicos', ch: '135', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0301114-1', nome: 'Sociologia da Educação', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '3º Semestre', data: [
        { codigo: '0501004-1', nome: 'Epidemiologia e Enfermagem', ch: '120', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0301115-1', nome: 'Filosofia da Educação', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501006-1', nome: 'Gênero e Enfermagem', ch: '30', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501005-1', nome: 'Processo de Investigação em Enfermagem', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501028-1', nome: 'Processos Patológicos', ch: '135', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '4º Semestre', data: [
        { codigo: '0501008-1', nome: 'Enfermagem em Saúde Coletiva', ch: '90', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501029-1', nome: 'Processos Terapêuticos', ch: '135', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0301116-1', nome: 'Psicologia da Aprendizagem', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501007-1', nome: 'Semiologia e Semiotécnica de Enfermagem no Processo Saúde/Doença do Adulto', ch: '225', aplicacao: 'Teórica', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '5º Semestre', data: [
        { codigo: '0501034-1', nome: 'Educação em Saúde', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501011-1', nome: 'Enfermagem no Processo Saúde/Doença da Criança e do Adolescente', ch: '150', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501010-1', nome: 'Exercício de Enfermagem', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501012-1', nome: 'O Processo Gerenciar da Enfermagem', ch: '90', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0301117-1', nome: 'Organização da Educação Brasileira', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501030-1', nome: 'Saúde Ambiental', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501009-1', nome: 'Semiologia e Semiotécnica de Enfermagem no Processo Saúde/Doença da Criança', ch: '75', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '6º Semestre', data: [
        { codigo: '0301118-1', nome: 'Didática', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501014-1', nome: 'Enfermagem na Saúde/Doença do Processo Produtivo', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501015-1', nome: 'Enfermagem no Processo de Reprodução Humana', ch: '210', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501036-1', nome: 'Estágio em Prática de Ensino I', ch: '105', aplicacao: 'Prática', situacao: 'Obrigatória' },
        { codigo: '0501013-1', nome: 'Pesquisa e Enfermagem', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501016-1', nome: 'Temas Avançados em Saúde Coletiva', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },

    {
      title: '7º Semestre', data: [
        { codigo: '0501018-1', nome: 'Enfermagem do Processo Saúde/Doença da 3ª Idade', ch: '90', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501019-1', nome: 'Enfermagem no Processo Saúde/Doença do Adulto', ch: '270', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501037-1', nome: 'Estágio em Prática de Ensino II', ch: '105', aplicacao: 'Prática', situacao: 'Obrigatória' },
        { codigo: '0501038-1', nome: 'Gestão do Processo Ensinar/Aprender', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '8º Semestre', data: [
        { codigo: '0501039-1', nome: 'Estágio em Prática de Ensino III', ch: '105', aplicacao: 'Prática', situacao: 'Obrigatória' },
        { codigo: '0501041-1', nome: 'Estágio em Serviços de Saúde I', ch: '420', aplicacao: 'Prática', situacao: 'Obrigatória' },
        { codigo: '0501022-1', nome: 'Estudos Orientados para Elaboração de Monografia', ch: '30', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '9º Semestre', data: [
        { codigo: '0501040-1', nome: 'Estágio em Prática de Ensino IV', ch: '105', aplicacao: 'Prática', situacao: 'Obrigatória' },
        { codigo: '0501042-1', nome: 'Estágio em Serviços de Saúde II', ch: '420', aplicacao: 'Prática', situacao: 'Obrigatória' },
        { codigo: '0501044-1', nome: 'Monografia', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: "Outros Componentes",
      data: [
        { codigo: "0701088-1", nome: "Cultura Brasileira", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0301033-1", nome: "Educação de Jovens e Adultos", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501043-1", nome: "Educação Popular em Saúde", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501032-1", nome: "Ética Social", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0701115-1", nome: "Família, Parentesco e Ciclos de Vida", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501075-1", nome: "Formação e Cuidado da Pessoa com Deficiência e Transtornos do Desenvolvimento", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0701116-1", nome: "Gênero e Sexualidade", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0301005-1", nome: "História da Educação", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501073-1", nome: "Informática Aplicada à Enfermagem", ch: "60", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501074-1", nome: "Mecanismos de Agressão e Defesa", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501033-1", nome: "Metodologia da Investigação em Saúde Coletiva", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501000-1", nome: "Pesquisa Clínica e Epidemiológica", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0601107-1", nome: "Prática Desportiva I", ch: "30", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0601108-1", nome: "Prática Desportiva II", ch: "30", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501076-1", nome: "Práticas Integrativas e os Cuidados Humanescente em Saúde", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501035-1", nome: "Primeiros Socorros", ch: "60", aplicacao: "Teórica", situacao: "Optativa" }
      ]
    }
  ];

  // Informações gerais do curso (Grade nova)
  const cursoInfoNova = [
    'Curso: [100910-0] Enfermagem - Bacharelado',
    'Matriz Curricular: 2021.1 [Válida para ingressantes a partir de 2021.1]',
    'Campus/Cidade: Campus Central - Mossoró',
    'Faculdade: Faculdade de Enfermagem - FAEN',
    'Obrigatórias: 3510 horas',
    'Optativas: 540 horas',
    'Ativ. Complementares: 150 horas',
    'Total a integralizar: 4200 horas',
    'Eletivas: 240 horas',
  ];

  // Dados da estrutura curricular (Grade nova)
  const disciplinasNova = [
    {
      title: '1º Semestre', data: [
        { codigo: '0501117-1', nome: 'Atenção e Assistência em Urgência e Emergência - Suporte Básico de Vida', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501114-1', nome: 'Biologia Celular e Molecular', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501116-1', nome: 'Conhecimento científico: leituras e técnicas', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501113-1', nome: 'Embriologia Geral e Histologia', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501118-1', nome: 'Gênero, sociedade e diversidade', ch: '60', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501119-1', nome: 'Necessidades de saúde e enfermagem', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501115-1', nome: 'Sociedade, Estado, Universidade e Enfermagem', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
      ]
    },

    {
      title: '2º Semestre', data: [
        { codigo: '0501120-1', nome: 'Antropologia e Saúde', ch: '30', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501122-1', nome: 'Comportamento humano e relações', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501121-1', nome: 'Cultura, Sociedade e Reflexões', ch: '30', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501123-1', nome: 'Fisiologia humana', ch: '90', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501125-1', nome: 'História e processo de trabalho em enfermagem', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501124-1', nome: 'Morfologia', ch: '90', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '3º Semestre', data: [
        { codigo: '0501128-1', nome: 'Enfermagem em saúde coletiva', ch: '90', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501131-1', nome: 'Estudos científicos: teorias e métodos da pesquisa', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501129-1', nome: 'Ética, bioética e cidadania', ch: '60', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501127-1', nome: 'Fisiopatologia I', ch: '90', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501130-1', nome: 'Mecanismos de Agressão e Defesa', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501126-1', nome: 'Saúde ambiental', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '4º Semestre', data: [
        { codigo: '0501134-1', nome: 'Epidemiologia e enfermagem', ch: '90', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501133-1', nome: 'Fisiopatologia II', ch: '75', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501132-1', nome: 'Semiologia e Semiotécnica I', ch: '120', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501135-1', nome: 'Sistematização da assistência e o processo de enfermagem', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501136-1', nome: 'Terapias e processos farmacológicos aplicados a enfermagem', ch: '90', aplicacao: 'Teórica', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '5º Semestre', data: [
        { codigo: '0501139-1', nome: 'Educação em saúde', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501140-1', nome: 'Estudos científicos: Natureza e interfaces da pesquisa', ch: '45', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501138-1', nome: 'O processo gerenciar de enfermagem', ch: '75', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501141-1', nome: 'Saúde mental', ch: '75', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501137-1', nome: 'Semiologia e Semiotécnica de Enfermagem II', ch: '120', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: '6º Semestre', data: [
        { codigo: '0501146-1', nome: 'Desenvolvimento Profissional em Enfermagem', ch: '60', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501145-1', nome: 'Enfermagem em Saúde do Trabalhador', ch: '60', aplicacao: 'Teórica', situacao: 'Obrigatória' },
        { codigo: '0501142-1', nome: 'Enfermagem nas Ações Integradas a Saúde do idoso', ch: '45', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501144-1', nome: 'Enfermagem nas ações integradas a saúde na infância e adolescência', ch: '105', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
        { codigo: '0501143-1', nome: 'Enfermagem nas ações integradas na saúde do adulto', ch: '90', aplicacao: 'Teórica/Prática', situacao: 'Obrigatória' },
      ]
    },
    {
      title: "7º Semestre",
      data: [
        { codigo: "0501147-1", nome: "Criação de conteúdo, empreendedorismo e tecnologias", ch: "45", aplicacao: "Teórica/Prática", situacao: "Obrigatória" },
        { codigo: "0501149-1", nome: "Enfermagem cirúrgica", ch: "45", aplicacao: "Teórica/Prática", situacao: "Obrigatória" },
        { codigo: "0501148-1", nome: "Enfermagem nas ações integradas materno infantil", ch: "105", aplicacao: "Teórica/Prática", situacao: "Obrigatória" },
        { codigo: "0501150-1", nome: "Trabalho de conclusão de curso I", ch: "45", aplicacao: "Teórica", situacao: "Obrigatória" }
      ]
    },
    {
      title: "8º Semestre",
      data: [
        { codigo: "0501152-1", nome: "Atenção e Assistência em Urgência e Emergência - Suporte avançado de Vida", ch: "45", aplicacao: "Teórica/Prática", situacao: "Obrigatória" },
        { codigo: "0501151-1", nome: "Enfermagem nas ações integradas ao paciente crítico", ch: "120", aplicacao: "Teórica/Prática", situacao: "Obrigatória" },
        { codigo: "0501153-1", nome: "Trabalho de conclusão de Curso II", ch: "60", aplicacao: "Teórica", situacao: "Obrigatória" }
      ]
    },
    {
      title: "9º Semestre",
      data: [
        { codigo: "0501154-1", nome: "Estágio em serviços de saúde I", ch: "420", aplicacao: "Prática", situacao: "Obrigatória" }
      ]
    },
    {
      title: "10º Semestre",
      data: [
        { codigo: "0501154-1", nome: "Estágio em serviços de saúde II", ch: "420", aplicacao: "Prática", situacao: "Obrigatória" }
      ]
    },
    {
      title: "Outros Componentes",
      data: [
        { codigo: "0801011-1", nome: "Bioestatística", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501189-1", nome: "Bioestatística com o uso de software estatístico", ch: "60", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501043-1", nome: "Educação Popular em Saúde", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0401089-1", nome: "Língua Brasileira de Sinais", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501033-1", nome: "Metodologia da Investigação em Saúde Coletiva", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501000-1", nome: "Pesquisa Clínica e Epidemiológica", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501076-1", nome: "Práticas Integrativas e os Cuidados Humanescentes em Saúde", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501190-1", nome: "Princípios da Bioestatística", ch: "60", aplicacao: "Teórica", situacao: "Optativa" },
        { codigo: "0501156-1", nome: "UCE I", ch: "30", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501157-1", nome: "UCE II", ch: "30", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501158-1", nome: "UCE III", ch: "30", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501159-1", nome: "UCE IV", ch: "30", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501164-1", nome: "UCE IX", ch: "45", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501160-1", nome: "UCE V", ch: "45", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501161-1", nome: "UCE VI", ch: "45", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501162-1", nome: "UCE VII", ch: "45", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501163-1", nome: "UCE VIII", ch: "45", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501165-1", nome: "UCE X", ch: "45", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501166-1", nome: "UCE XI", ch: "75", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501167-1", nome: "UCE XII", ch: "75", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501168-1", nome: "UCE XIII", ch: "75", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501169-1", nome: "UCE XIV", ch: "105", aplicacao: "Teórica/Prática", situacao: "Optativa" },
        { codigo: "0501170-1", nome: "UCE XV", ch: "105", aplicacao: "Teórica/Prática", situacao: "Optativa" }
      ]
    }

  ];

  return (
    <ImageBackground
      source={require('../assets/images/background.png')} // Caminho para sua imagem de fundo
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay} />
      <SectionList
        sections={[
          {
            title: 'Matriz Curricular Nova',
            data: disciplinasNova,
            header: cursoInfoNova,
          },
          {
            title: 'Matriz Curricular Antiga',
            data: disciplinasAntiga,
            header: cursoInfoAntiga,
          },
        ]}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item }) => (
          <View>
            {/* Título do Semestre com a Barra Azul */}
            <View style={styles.semesterHeader}>
              <Text style={styles.semesterText}>{item.title}</Text>
            </View>
            {/* Disciplinas */}
            {item.data.map((disciplina, index) => (
              <View key={`${disciplina.codigo}-${index}`} style={styles.row}>
                <Text style={[styles.cell, styles.border]}>{disciplina.codigo}</Text>
                <Text style={[styles.cell, styles.border]}>{disciplina.nome}</Text>
                <Text style={[styles.cell, styles.border]}>{disciplina.ch}</Text>
                <Text style={[styles.cell, styles.border]}>{disciplina.aplicacao}</Text>
                <Text style={[styles.cell, styles.border]}>{disciplina.situacao}</Text>
              </View>
            ))}
          </View>
        )}
        renderSectionHeader={({ section: { title, header } }) => (
          <View>
            {/* Informações da Grade */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>{title}</Text>
              {header.map((info, index) => (
                <Text key={index} style={styles.infoText}>
                  {info}
                </Text>
              ))}
            </View>
            {/* Cabeçalho da Tabela */}
            <View style={styles.header}>
              <Text style={[styles.headerCell, styles.border]}>Código</Text>
              <Text style={[styles.headerCell, styles.border]}>Disciplina</Text>
              <Text style={[styles.headerCell, styles.border]}>CH</Text>
              <Text style={[styles.headerCell, styles.border]}>Aplicação</Text>
              <Text style={[styles.headerCell, styles.border]}>Situação</Text>
            </View>
          </View>
        )}
        
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Quer conhecer o PPC de Enfermagem?</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL(
                  'https://drive.google.com/file/d/1nVf9f6dTH7YiWJ8ObS8Wm_8qgFbJv5OX/view'
                )
              }
            >
              <Text style={styles.buttonText}>Clique Aqui!</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>Manual de Trabalhos Acadêmicos da UERN</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL(
                  'https://portal.uern.br/dsib/wp-content/uploads/sites/2/2023/08/MANUAL-DE-TCC-UERN-2023-atualizado-em-07-de-agosto-2023.pdf'
                )
              }
            >
              <Text style={styles.buttonText}>Clique Aqui!</Text>
            </TouchableOpacity>

            {/* Accordion 1 */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setRegimentoOpen(!isRegimentoOpen)}
            >
              <View style={styles.accordionRow}>
                <Text style={styles.accordionHeaderText}>
                  Regimento dos Laboratórios de Ensino da FAEN
                </Text>
                <Ionicons
                  name={isRegimentoOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#00008B"
                />
              </View>
            </TouchableOpacity>

            {isRegimentoOpen && (
              <View style={styles.accordionContent}>
                <Text style={styles.accordionText}>
                  Esse documento dispõe sobre os deveres, responsabilidades, proibições e normas
                  referentes ao uso dos Laboratórios da Faculdade de Enfermagem (FAEN) do Campus
                  Central da Universidade do Estado do Rio Grande do Norte (UERN).
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    Linking.openURL(
                      'https://drive.google.com/file/d/1_5VSfIwJcGpg-e6pUNJ0ZorSCl8L8Vxy/view'
                    )
                  }
                >
                  <Text style={styles.buttonText}>Clique Aqui!</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Accordion 2 */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setCartilhaOpen(!isCartilhaOpen)}
            >
              <View style={styles.accordionRow}>
                <Text style={styles.accordionHeaderText}>
                  Cartilha dos Direitos e Deveres dos Alunos da UERN
                </Text>
                <Ionicons
                  name={isCartilhaOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#00008B"
                />
              </View>
            </TouchableOpacity>

            {isCartilhaOpen && (
              <View style={styles.accordionContent}>
                <Text style={styles.accordionText}>
                  Nesse material está alguns direitos e deveres dos alunos da Faen/Uern, tais como: Os
                  Princípios Fundamentais da Universidade; Os Compromissos da UERN; Deveres dos
                  Discentes; Direitos dos Discentes; Trancamento; Oferta de Componentes Especiais;
                  Aproveitamento de Disciplinas; Avaliação de Rendimento Acadêmico; Formas de Ingresso.
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    Linking.openURL(
                      'https://portal.uern.br/eduern/wp-content/uploads/sites/14/2025/02/Cartilha-Conhecendo-Direitos-e-Deveres-do-Estudante-FAEN-UERN.pdf'
                    )
                  }
                >
                  <Text style={styles.buttonText}>Clique Aqui!</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Accordion 3 */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setCurricularSimplificadaOpen(!isCurricularSimplificadaOpen)}
            >
              <View style={styles.accordionRow}>
                <Text style={styles.accordionHeaderText}>
                  Cartilha da Estrutura Curricular Simplificada
                </Text>
                <Ionicons
                  name={isCurricularSimplificadaOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#00008B"
                />
              </View>
            </TouchableOpacity>

            {isCurricularSimplificadaOpen && (
              <View style={styles.accordionContent}>
                <Text style={styles.accordionText}>
                  Aqui você encontrará tudo que você precisa saber sobre o curso de Enfermagem da FAEN
                  com uma linguagem fácil e acessível.
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    Linking.openURL(
                      'https://portal.uern.br/eduern/wp-content/uploads/sites/14/2025/02/Cartilha-Tudo-que-voce-precisa-saber-sobre-o-curso-de-Enfermagem.pdf'
                    )
                  }
                >
                  <Text style={styles.buttonText}>Clique Aqui!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.container}
      />
    </ImageBackground>
  );

};

const colors = {
  primary: '#00008B',
  backgroundLight: '#f2f2f2',
  textDark: '#000',
  textLight: '#fff',
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fafafa80',
  },
  container: {
    padding: 20,
    marginBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.textDark,
    marginVertical: 5,
  },
  infoContainer: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: colors.backgroundLight,
    padding: 10,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 5,
    color: colors.textDark,
  },
  border: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    marginVertical: 10,
  },
  headerCell: {
    flex: 1,
    fontSize: 13.4,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.textLight,
  },
  semesterHeader: {
    backgroundColor: colors.primary, // Fundo azul
    paddingVertical: 8, // Ajusta o espaçamento
    marginVertical: 5, // Espaçamento superior e inferior
  },
  semesterText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.textLight, // Texto branco
  },
  footerPadding: {
    height: 50,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: colors.textDark,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    color: "#00008B",
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00008B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  accordionHeader: {
    backgroundColor: '#f0f8ff',
    borderColor: '#00008B',
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  accordionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  accordionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00008B', // Cor do texto combinando com a borda
    flex: 1, // Faz o texto ocupar o espaço restante
    marginRight: 10,
    textAlign: 'center',
  },

  accordionContent: {
    padding: 15,
    backgroundColor: colors.backgroundLight,
    borderRadius: 5,
    marginTop: 5,
  },

  accordionText: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },

});


export default EstruturaCurricularScreen;