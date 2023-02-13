package com.cedaniel200.screenplay.dojo.stepdefinition;

import com.cedaniel200.screenplay.dojo.exception.IngresoFallido;
import com.cedaniel200.screenplay.dojo.question.LaPaginaDeInicio;
import com.cedaniel200.screenplay.dojo.task.PresionarBoton;
import com.cedaniel200.screenplay.dojo.task.VolverPaginaInicio;
import com.cedaniel200.screenplay.dojo.userinterface.InicioRadarPage;
import cucumber.api.java.Before;
import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import net.serenitybdd.screenplay.actions.Open;
import net.serenitybdd.screenplay.actors.OnStage;
import net.serenitybdd.screenplay.actors.OnlineCast;

import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;
import static net.serenitybdd.screenplay.actors.OnStage.theActorCalled;
import static net.serenitybdd.screenplay.actors.OnStage.theActorInTheSpotlight;

public class VisualizarRadarStepDefinition {

    private InicioRadarPage inicioRadarPage;

    @Before
    public void setTheStage() {
        OnStage.setTheStage(new OnlineCast());
    }

    @Given("^(.*) quiere visualizar el radar$")
    public void quiereVisualizarElRadar(String actor) {
        theActorCalled(actor).attemptsTo(Open.browserOn(inicioRadarPage));
    }

    @When("^Andres ingresa a la pagina$")
    public void andresIngresaALaPagina() {
        theActorInTheSpotlight().should(seeThat(LaPaginaDeInicio.esVisible())
                .orComplainWith(IngresoFallido.class, "Access failed"));
    }

    @Then("^Andres debe ver el radar$")
    public void andresDebeVerElRadar() {
        theActorInTheSpotlight().attemptsTo(PresionarBoton.con());

        theActorInTheSpotlight().attemptsTo(VolverPaginaInicio.con());
    }

}
