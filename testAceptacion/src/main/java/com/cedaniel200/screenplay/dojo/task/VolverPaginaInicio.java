package com.cedaniel200.screenplay.dojo.task;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.actions.Click;
import net.thucydides.core.annotations.Step;

import static com.cedaniel200.screenplay.dojo.userinterface.QuadrantPage.*;
import static net.serenitybdd.screenplay.Tasks.instrumented;

public class VolverPaginaInicio implements Task {

    @Override
    @Step("{0} performs an authentication")
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(Click.on(GOBACK));
    }

    public static VolverPaginaInicio con() {
        return instrumented(VolverPaginaInicio.class);
    }
}
