package com.cedaniel200.screenplay.dojo.runner;

import cucumber.api.CucumberOptions;
import cucumber.api.SnippetType;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(features = "src/test/resources/features/visualizar_radar.feature",
        glue = {"com.cedaniel200.screenplay.dojo.stepdefinition"}, snippets = SnippetType.CAMELCASE)
public class visualizarRadar {
}
