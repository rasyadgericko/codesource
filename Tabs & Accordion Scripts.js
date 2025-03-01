<!-- [Attributes by Finsweet] Accordion -->
<script defer src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-accordion@1/accordion.js"></script>

<!-- Accordion Schema & Interaction Script -->
<script>
document.addEventListener("DOMContentLoaded", function () {
    // Define a unique key to store the initialization flag on the window object
    const ACCORDION_INIT_FLAG = "customAccordionInitialized";

    // Check if the script has already been initialized
    if (window[ACCORDION_INIT_FLAG]) {
        console.warn("Accordion script has already been initialized.");
        return;
    }

    // Function to initialize accordions and generate FAQ schema
    function initializeAccordions() {
        // Select all accordion groups
        const accordionGroups = document.querySelectorAll(
            '[cl-accordion="group"], [fs-accordion-element="group"], [cl-accordion="interlinking"]'
        );

        // If no groups are found, exit the script
        if (accordionGroups.length === 0) {
            //console.info("No accordion groups found. Script will not run.");
            return;
        }

        // Array to hold FAQ items for the schema
        const faqItems = [];
        const topOffset = 200;

        function scrollToAccordionTrigger(group, clickedTrigger) {
            const groupTop =
                group.getBoundingClientRect().top + window.pageYOffset;
            const allTriggers = group.querySelectorAll(
                '[cl-accordion="trigger"], [fs-accordion-element="trigger"]'
            );

            let totalHeight = 0;
            for (let i = 0; i < allTriggers.length; i++) {
                const trigger = allTriggers[i];
                if (trigger === clickedTrigger) break;

                const triggerHeight = trigger.getBoundingClientRect().height;
                const triggerStyle = window.getComputedStyle(trigger);
                const marginBottom = parseFloat(triggerStyle.marginBottom);
                totalHeight += triggerHeight + marginBottom;
            }

            const scrollPosition = groupTop + totalHeight - topOffset;
            window.scrollTo({ top: scrollPosition, behavior: "smooth" });
        }

        accordionGroups.forEach((group) => {
            const interactionType = group.getAttribute(
                "cl-accordion-interaction"
            );
            const accordions = group.querySelectorAll('[cl-accordion="item"], [fs-accordion-element="accordion"]');

            accordions.forEach((accordion) => {
                const trigger = accordion.querySelector(
                    '[cl-accordion="trigger"], [fs-accordion-element="trigger"]'
                );
                const content = accordion.querySelector(
                    '[cl-accordion="content"], [fs-accordion-element="content"]'
                );

                if (trigger && content) {
                    trigger.setAttribute("aria-controls", content.id);
                    content.setAttribute("aria-labelledby", trigger.id);

                    const questionElement = trigger.querySelector(
                        '[cl-accordion="header-text"]'
                    );
                    const questionText = questionElement
                        ? questionElement.textContent.trim()
                        : "";

                    const answerElement = content.querySelector(
                        ".content-rich-text"
                    );
                    const answerText = answerElement
                        ? answerElement.innerHTML.trim()
                        : "";

                    if (questionText && answerText) {
                        faqItems.push({
                            "@type": "Question",
                            name: questionText,
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: answerText,
                            },
                        });
                    }

                    if (interactionType === "true") {
                        trigger.addEventListener("click", () => {
                            const isExpanded =
                                trigger.getAttribute("aria-expanded") === "true";

                            scrollToAccordionTrigger(group, trigger);

                            if (isExpanded) return;

                            setTimeout(() => {
                                const updatedAccordions =
                                    group.querySelectorAll(
                                        '[cl-accordion="item"], [fs-accordion-element="accordion"]'
                                    );

                                updatedAccordions.forEach((otherAccordion) => {
                                    const otherTrigger =
                                        otherAccordion.querySelector(
                                            '[cl-accordion="trigger"], [fs-accordion-element="trigger"]'
                                        );
                                    if (
                                        otherTrigger !== trigger &&
                                        otherTrigger.getAttribute(
                                            "aria-expanded"
                                        ) === "true"
                                    ) {
                                        otherTrigger.click();
                                    }
                                });
                            }, 10);
                        });
                    } /*else if (interactionType === "false") {
                        trigger.addEventListener("click", () => {
                            scrollToAccordionTrigger(group, trigger);
                        });
                    } */
                } else {
                    console.warn(
                        "Accordion is missing either a trigger or content element:",
                        accordion
                    );
                }
            });
        });

        if (faqItems.length > 0) {
            const faqSchema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "name": "PolicyMe FAQ",
                mainEntity: faqItems,
            };

            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.text = JSON.stringify(faqSchema, null, 2);
            document.head.appendChild(script);

            console.log("FAQ Schema has been successfully generated.");
        } else {
            console.warn("No valid FAQ items found to generate schema.");
        }

        window[ACCORDION_INIT_FLAG] = true;
        console.log("Accordion script initialized.");
    }

    initializeAccordions();
});
</script>

<!-- Accessible Accordion Script -->
<script>
document.addEventListener('DOMContentLoaded', function () {
    const accordionState = new Map(); // Store open accordion states per group

    // Function to open an accordion
    const openAccordion = (button, content) => {
        button.setAttribute('aria-expanded', 'true');
        content.style.display = 'block';
        setTimeout(() => content.style.maxHeight = content.scrollHeight + 'px', 0);

        // Add 'is-active' class to the accordion header
        const header = button.closest('[cl-accordion="trigger"]');
        if (header) header.classList.add('is-active');
    };

    // Function to close an accordion
    const closeAccordion = (button, content) => {
        button.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0';
        setTimeout(() => content.style.display = 'none', 350);

        // Remove 'is-active' class from the accordion header
        const header = button.closest('[cl-accordion="trigger"]');
        if (header) header.classList.remove('is-active');
    };

    // Function to restore previously open accordions
    const restoreAccordionState = (group) => {
        const savedButtons = accordionState.get(group) || new Set();
        savedButtons.forEach(buttonId => {
            const button = group.querySelector(`#${buttonId}`);
            const content = group.querySelector(`[cl-accordion="content"][aria-labelledby="${buttonId}"]`);
            if (button && content) openAccordion(button, content);
        });
    };

    // Function to initialize accordions
    const initAccordion = (group) => {
        const buttons = group.querySelectorAll('[cl-accordion="trigger"]');
        const singleAccordion = group.getAttribute('cl-accordion-single') === 'true';
        const shouldOpenFirst = group.getAttribute('cl-accordion-initial') !== 'false'; // Default to true
        const isInterlinking = group.getAttribute('cl-accordion') === 'interlinking';

        // Open the first accordion only if it's not an "interlinking" group
        if (!isInterlinking && shouldOpenFirst && !accordionState.has(group)) {
            const firstButton = buttons[0];
            if (firstButton) {
                const firstContent = group.querySelector(`[cl-accordion="content"][aria-labelledby="${firstButton.id}"]`);
                if (firstButton && firstContent) {
                    openAccordion(firstButton, firstContent);
                    accordionState.set(group, new Set([firstButton.id])); // Save state
                }
            }
        }

        buttons.forEach(button => {
            button.addEventListener('click', function () {
                const content = group.querySelector(`[cl-accordion="content"][aria-labelledby="${button.id}"]`);
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                let openAccordions = accordionState.get(group) || new Set();

                // Close all other accordions if single mode is enabled
                if (singleAccordion) {
                    buttons.forEach(otherButton => {
                        if (otherButton !== button) {
                            const otherContent = group.querySelector(`[cl-accordion="content"][aria-labelledby="${otherButton.id}"]`);
                            if (otherButton && otherContent) {
                                closeAccordion(otherButton, otherContent);
                                openAccordions.delete(otherButton.id);
                            }
                        }
                    });
                }

                // Toggle current accordion
                if (isExpanded) {
                    closeAccordion(button, content);
                    openAccordions.delete(button.id);
                } else {
                    openAccordion(button, content);
                    openAccordions.add(button.id);
                }

                accordionState.set(group, openAccordions);
            });

            button.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    };

    // Initialize all accordion groups dynamically
    const accordionGroups = document.querySelectorAll('[cl-accordion^="group"]');
    accordionGroups.forEach(group => initAccordion(group));

    // Handle tab switching and restore accordions
    const tabLinks = document.querySelectorAll('[cl-tabs-link]');
    tabLinks.forEach(tabLink => {
        tabLink.addEventListener('click', function () {
            const panelId = tabLink.getAttribute('aria-controls');
            const targetTab = document.getElementById(panelId);

            setTimeout(() => {
                const targetAccordionGroup = targetTab.querySelector('[cl-accordion^="group"]');
                if (targetAccordionGroup) restoreAccordionState(targetAccordionGroup);
            }, 10);
        });
    });
});
</script>


<!-- Accesible Tabs Script -->
<script>
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[cl-tabs-wrapper]').forEach(tabWrapper => {
    const tabs = tabWrapper.querySelectorAll('[cl-tabs-link]');
    const panels = tabWrapper.querySelectorAll('[role="tabpanel"]');

    function activateTab(tab) {
      const panelId = tab.getAttribute("aria-controls");
      const activePanel = tabWrapper.querySelector(`#${panelId}`);
      const currentPanel = tabWrapper.querySelector('[role="tabpanel"].active');

      if (currentPanel === activePanel) return; // Prevent reactivating the same tab

      // Update aria-selected for tabs within this wrapper
      tabs.forEach(t => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");

      // Fade out the current panel before switching
      if (currentPanel) {
        currentPanel.style.opacity = "0";
        currentPanel.style.pointerEvents = "none";

        setTimeout(() => {
          currentPanel.classList.remove('active'); // Remove active only after fade-out
          activePanel.classList.add('active');

          // Small delay before fading in the new panel
          setTimeout(() => {
            activePanel.style.opacity = "1";
            activePanel.style.pointerEvents = "all";
          }, 50);
        }, 300);
      } else {
        // If no panel was previously active, just show the new one
        activePanel.classList.add('active');
        setTimeout(() => {
          activePanel.style.opacity = "1";
          activePanel.style.pointerEvents = "all";
        }, 50);
      }
    }

    function handleKeydown(e, tab) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const newTab = e.key === "ArrowDown"
          ? tab.nextElementSibling || tabs[0]
          : tab.previousElementSibling || tabs[tabs.length - 1];

        newTab.focus();
        activateTab(newTab);
      }
    }

    tabs.forEach(tab => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (e) => handleKeydown(e, tab));
    });

    activateTab(tabs[0]); // Set initial active tab for each group
  });
});
</script>

<!-- Replace Attribute Script -->
<script>
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[cl-accordion^="group"]').forEach(group => {
      const groupNumber = group.getAttribute('cl-accordion').split('-')[1] || 1;

      group.querySelectorAll('[cl-accordion="trigger"]').forEach((trigger, index) => {
        const triggerId = `accordion-trigger-${index + 1}-${groupNumber}`;
        const contentId = `accordion-content-${index + 1}-${groupNumber}`;
        
        trigger.id = triggerId;
        trigger.setAttribute('aria-controls', contentId);

        group.querySelectorAll('[cl-accordion="content"]')[index].id = contentId;
        group.querySelectorAll('[cl-accordion="content"]')[index].setAttribute('aria-labelledby', triggerId);
      });
    });
  });
</script>