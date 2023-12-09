const Main = imports.ui.main;
const St = imports.gi.St;

function changeActivitiesText() {
    // Find the "Activities" label in the top bar and change its text
    const activitiesLabel = Main.panel.statusArea.activities.actor.get_children()[0];
    // activitiesLabel.text = "Деятельность"; // Change this text to whatever you prefer
    activitiesLabel.text = "アクティビティ"; // Change this text to whatever you prefer

    // Add CSS styling to change the text color to purple-ish neon
    // purple: "#ff6bff", yellow: "#adff2f", green: "#39ff14", red: "#ff0000", pastel-green: "#56e845"
    activitiesLabel.style = 'color: #7aff00; text-shadow: 0px 0px 10px #56e854;';
}

function enable() {
    // Enable the extension and change the "Activities" text color
    changeActivitiesText();
}

function disable() {
    // Disable the extension and reset the "Activities" text
    const activitiesLabel = Main.panel.statusArea.activities.actor.get_children()[0];
    activitiesLabel.text = "Activities";
    activitiesLabel.style = ''; // Reset the styling
}
