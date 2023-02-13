Feature: Visualizar
  Yo como empleado de Bancolombia quiero visualizar el radar de tecnologias utilizadas en el banco

  Scenario: Visualizar radar de tecnologias
    Given Andres quiere visualizar el radar
    When Andres ingresa a la pagina
    Then Andres debe ver el radar