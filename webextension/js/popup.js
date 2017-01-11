/* global browser, window, document, localStorage */
const CONTAINER_HIDE_SRC = "/img/container-hide.svg";
const CONTAINER_UNHIDE_SRC = "/img/container-unhide.svg";

function showContainerTabsPanel(identity) {
  // Populating the panel: name and icon
  document.getElementById("container-info-name").innerText = identity.name;

  let icon = document.getElementById("container-info-icon");
  icon.setAttribute("data-identity-icon", identity.image);
  icon.setAttribute("data-identity-color", identity.color);

  // Show or not the has-tabs section.
  for (let trHasTabs of document.getElementsByClassName("container-info-has-tabs")) {
    trHasTabs.hidden = !identity.hasHiddenTabs && !identity.hasOpenTabs;
    trHasTabs.setAttribute("data-user-context-id", identity.userContextId);
  }

  const hideShowIcon = document.getElementById("container-info-hideorshow-icon");
  hideShowIcon.src = identity.hasHiddenTabs ? CONTAINER_UNHIDE_SRC : CONTAINER_HIDE_SRC;

  const hideShowLabel = document.getElementById("container-info-hideorshow-label");
  hideShowLabel.innerText = identity.hasHiddenTabs ? "Show these container tabs" : "Hide these container tabs";

  // Let"s remove all the previous tabs.
  for (const trTab of document.getElementsByClassName("container-info-tab")) {
    trTab.remove();
  }

  // Let"s retrieve the list of tabs.
  browser.runtime.sendMessage({
    method: "getTabs",
    userContextId: identity.userContextId,
  }).then(tabs => {
    // For each one, let's create a new line.
    let fragment = document.createDocumentFragment();
    for (const tab of tabs) {
      let tr = document.createElement("tr");
      fragment.appendChild(tr);
      tr.classList.add("container-info-tab");
      tr.innerHTML = `
        <td><img class="icon" src="${tab.favicon}" /></td>
        <td>${tab.title}</td>`;
      // On click, we activate this tab.
      tr.addEventListener("click", () => {
        browser.runtime.sendMessage({
          method: "showTab",
          tabId: tab.id,
        }).then(() => {
          window.close();
        });
      });
    }

    document.getElementById("container-info-table").appendChild(fragment);
  })

  // Finally we are ready to show the panel.
  .then(() => {
    // FIXME: the animation...
    document.getElementById("container-panel").classList.add("hide");
    document.getElementById("container-info-panel").classList.remove("hide");
  });
}

if (localStorage.getItem("onboarded2")) {
  for (let element of document.querySelectorAll(".onboarding")) {
    element.classList.add("hide");
  }
  document.querySelector("#container-panel").classList.remove("hide");
} else if (localStorage.getItem("onboarded1")) {
  document.querySelector(".onboarding-panel-1").classList.add("hide");
  document.querySelector("#container-panel").classList.add("hide");
} else {
  document.querySelector(".onboarding-panel-2").classList.add("hide");
  document.querySelector("#container-panel").classList.add("hide");
}

document.querySelector("#onboarding-next-button").addEventListener("click", () => {
  localStorage.setItem("onboarded1", true);
  document.querySelector(".onboarding-panel-2").classList.remove("hide");
  document.querySelector(".onboarding-panel-1").classList.add("hide");
  document.querySelector("#container-panel").classList.add("hide");
});

document.querySelector("#onboarding-done-button").addEventListener("click", () => {
  localStorage.setItem("onboarded2", true);
  document.querySelector(".onboarding-panel-1").classList.add("hide");
  document.querySelector(".onboarding-panel-2").classList.add("hide");
  document.querySelector("#container-panel").classList.remove("hide");
});

browser.runtime.sendMessage({method: "queryIdentities"}).then(identities => {
  let fragment = document.createDocumentFragment();

  identities.forEach(identity => {
    let tr = document.createElement("tr");
    fragment.appendChild(tr);
    tr.setAttribute("data-identity-cookie-store-id", identity.userContextId);
    tr.innerHTML = `
      <td>
        <div class="userContext-icon open-newtab"
          data-identity-icon="${identity.image}"
          data-identity-color="${identity.color}">
        </div>
      </td>
      <td class="open-newtab">${identity.name}</td>
      <td class="info">&gt;</td>`;

    tr.addEventListener("click", e => {
      if (e.target.matches(".open-newtab")) {
        browser.runtime.sendMessage({
          method: "showTabs",
          userContextId: identity.userContextId
        }).then(() => {
          return browser.runtime.sendMessage({
            method: "openTab",
            userContextId: identity.userContextId,
          });
        }).then(() => {
          window.close();
        });
      } else if (e.target.matches(".info")) {
        showContainerTabsPanel(identity);
      }
    });
  });

  document.querySelector(".identities-list").appendChild(fragment);
});

document.querySelector("#edit-containers-link").addEventListener("click", () => {
  browser.runtime.sendMessage({
    method: "openTab",
    url: "about:preferences#containers"
  }).then(() => {
    window.close();
  });
});

document.querySelector("#sort-containers-link").addEventListener("click", () => {
  browser.runtime.sendMessage({
    method: "sortTabs"
  }).then(() => {
    window.close();
  });
});

document.querySelector("#close-container-info-panel").addEventListener("click", () => {
  // TODO: animation
  document.getElementById("container-info-panel").classList.add("hide");
  document.getElementById("container-panel").classList.remove("hide");
});

document.querySelector("#container-info-hideorshow").addEventListener("click", e => {
  let userContextId = e.target.parentElement.getAttribute("data-user-context-id");
  browser.runtime.sendMessage({
    method: "getIdentity",
    userContextId,
  }).then(identity => {
    return browser.runtime.sendMessage({
      method: identity.hasHiddenTabs ? "showTabs" : "hideTabs",
      userContextId: identity.userContextId
    });
  }).then(() => {
    window.close();
  });
});

document.querySelector("#container-info-movetabs").addEventListener("click", e => {
  return browser.runtime.sendMessage({
    method: "moveTabsToWindow",
    userContextId: e.target.parentElement.getAttribute("data-user-context-id"),
  }).then(() => {
    window.close();
  });
});
