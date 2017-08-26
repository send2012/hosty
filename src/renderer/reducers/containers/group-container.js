import { handleActions } from 'redux-actions';
import * as ActionTypes from '../../actions';

export default handleActions({
  [ActionTypes.SORT_GROUPS]: (state, action) => {
    const { options } = action.payload;
    return Object.assign({}, state, { sortOptions: options });
  },
}, {
  focusedId: 0,
  selectedIds: [],
  sortOptions: {},
  copiedGroups: [],
});
