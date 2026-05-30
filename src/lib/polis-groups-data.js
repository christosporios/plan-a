// The three opinion groups from the Pol.is report (pol.is/report/r7brycbsvbxe94w2mufnf),
// characterized from each group's representative votes. Plain data (no JSX / icon
// deps) so it can be imported by the Node PDF build script as well as the app.
// size = group members.
export const POLIS_GROUPS_DATA = [
  {
    label: 'A', color: '#4a7a8c', size: 107,
    title: 'Επιφυλακτικοί',
    desc: 'Προτεραιότητα στο αυτοκίνητο· σκεπτικισμός για πεζοδρομήσεις και ποδήλατο.',
  },
  {
    label: 'B', color: '#ab8540', size: 138,
    title: 'Πολιτισμός & τοπική οικονομία',
    desc: 'Ανάδειξη της ιστορίας, στήριξη μικρών επιχειρήσεων και φορέων πολιτισμού.',
  },
  {
    label: 'C', color: '#6e5a8a', size: 1442,
    title: 'Η μεγάλη πλειοψηφία',
    desc: 'Λιγότερα αυτοκίνητα, βιώσιμη μετακίνηση, περισσότερο πράσινο, έλεγχος του τουρισμού.',
  },
];
