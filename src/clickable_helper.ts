import webdriver from 'selenium-webdriver';
function isElementClickable(element: any) {
    const SCRIPT = `
        var elem = arguments[0];
        var rect = elem.getBoundingClientRect();
        var x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
        var elementAtPoint = document.elementFromPoint(x, y);
        if(!elementAtPoint) return false;
        do {
            if (elementAtPoint === elem) return true;
        } while (elementAtPoint = elementAtPoint.parentNode);
        return false;
    `;

    return element.getDriver().executeScript(SCRIPT, element);
}

export function elementIsClickableCondition(locator: any) {
    return new webdriver.WebElementCondition('until element is visible', async function (driver) {
        try {
            // find the element(s)
            const elements = await driver.findElements(locator);
            if (elements.length > 1) {
                // throw new Error(`elementIsClickableCondition: the locator "${locator.toString()} identifies "${elements.length} instead of 1 element`);
            } else if (elements.length < 1) {
                return null;
            }

            const element = elements[0];

            // basic check if the element is visible using the build-in functionality
            if (!await element.isDisplayed()) {
                return null;
            }

            // really check if the element is visible
            const visible = await isElementClickable(element);

            return visible ? element : null;
        } catch (err) {
            if (err instanceof webdriver.error.StaleElementReferenceError) {
                return null;
            } else {
                throw err;
            }
        }
    });
}