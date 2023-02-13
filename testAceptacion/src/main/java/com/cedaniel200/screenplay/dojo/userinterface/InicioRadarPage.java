package com.cedaniel200.screenplay.dojo.userinterface;

import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.screenplay.targets.Target;
import net.thucydides.core.annotations.DefaultUrl;
import org.openqa.selenium.By;

// @DefaultUrl("http://127.0.0.1:8080")
@DefaultUrl("https://radar-dev.apps.ambientesbc.com/")
public class InicioRadarPage extends PageObject {

    public static final Target TOOLS = Target.the("Tools").located(By.id("radar-plot"));

}
