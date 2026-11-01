# Compact Solitaire columns — 1.7.3

The board now uses its actual React Native onLayout viewport after the tab dock, status and side controls occupy their space. Top piles and all tableau columns fit that measured area. The board uses absolute card positions with explicit column heights instead of negative card margins and an overflowing board ScrollView.

Each column keeps its face-down prefix, first exposed card and outermost card visible. Interior face-up cards remain in the game state but are not drawn. A localized +count button opens a stack picker: choose an interior card, then tap a legal destination to move its complete suffix. This preserves partial-sequence moves, undo, hints, double tap and the original saved deal. Dragging the complete run shows only its visible endpoint cards. Card size depends only on the viewport; other columns do not jump when one column changes.

Executed: TypeScript, formatting, 40 engine/presentation tests and 38 native component tests across Android/iOS presets. Geometry tests cover measured small phone viewports through tablets, initial deals, 13 exposed cards and a 19-card column, stationary unrelated columns, and collapsed middle indices. Native regression supplies a 414×190 board viewport, checks the final card bounds, selects a hidden queen, moves its suffix onto a king and undoes the move without losing the original 19-card column.

Jest does not render native screenshots or establish physical-device appearance, touch comfort, OEM safe areas or frame rate. Device review is still required. This change does not publish an environment, push source or publish an APK.
