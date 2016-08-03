import Monkberry from 'monkberry';
import Template from './modal.monk';

export default class extends Template {
    constructor() {
        super();

        // Define internal state of your compenent if you need to.
        this.state = {
            name: 'blah'
            ,isActive: false
        };

        // Add event listeners.
        this.on( 'click', '.close', this.show.bind(this, false) );
    }

    update( state ) {
        // Define actions to do on state updates.
        Object.assign(this.state, state);

        // Call update of view itself.
        super.update(this.state);
    }

    show( visibility = true ) {
        console.log( visibility );
        this.update( { isActive: Boolean(visibility) });
    }
}
;
