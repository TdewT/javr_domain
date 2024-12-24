//Global

export const GamePickerKeys = {
    UNSORTED: 'unsorted',
    PREFERRED: 'preferred',
    NEUTRAL: 'neutral',
    EXCLUDED: 'excluded',
};

// Main-page
export function enterEditPage(router) {
    router.push(`${router.pathname}-edit`).then(() =>{
        // noinspection JSUnresolvedReference
        window.location.reload();
    })
}

// Edit-page

export function exitEditPage(router) {
    router.push(`${router.pathname.replace('-edit', '')}`).then(() =>{
        // noinspection JSUnresolvedReference
        window.location.reload();
    })
}


export const changedCardsKeys = {
    MARKED_FOR_DELETE: 'markedForDelete',
    CHANGED_CARDS: 'changedCards',
    NEW_CARDS: 'newCards'
};

const changedCardsDefault = {markedForDelete: [], changedCards: [], newCards: []};

export let changedCards = changedCardsDefault;

export function clearChangedCards() {
    changedCards = changedCardsDefault;
}

export function changedCardsUnderKey(gameCard, key) {
    for (const card of changedCards[key]) {
        if (JSON.stringify(card) === JSON.stringify(gameCard)) {
            return true;
        }
    }
    return false;
}

export function addChangedCard(gameCard, key) {
    if (Object.values(changedCardsKeys).includes(key)) {
        changedCards[key].push(gameCard);
    }
}

export function removeChangedCard(gameCard, key) {
    if (Object.values(changedCardsKeys).includes(key)) {
        changedCards[key] = changedCards[key].filter(card => JSON.stringify(card) !== JSON.stringify(gameCard));
    }
}