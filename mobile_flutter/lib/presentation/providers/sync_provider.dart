import 'package:flutter_riverpod/flutter_riverpod.dart';

// Sync state
class SyncState {
  final bool isSyncing;
  final bool isOnline;
  final int pendingSyncCount;
  final DateTime? lastSyncTime;
  final String? syncError;

  SyncState({
    this.isSyncing = false,
    this.isOnline = true,
    this.pendingSyncCount = 0,
    this.lastSyncTime,
    this.syncError,
  });

  SyncState copyWith({
    bool? isSyncing,
    bool? isOnline,
    int? pendingSyncCount,
    DateTime? lastSyncTime,
    String? syncError,
  }) {
    return SyncState(
      isSyncing: isSyncing ?? this.isSyncing,
      isOnline: isOnline ?? this.isOnline,
      pendingSyncCount: pendingSyncCount ?? this.pendingSyncCount,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
      syncError: syncError ?? this.syncError,
    );
  }
}

// Sync notifier
class SyncNotifier extends StateNotifier<SyncState> {
  SyncNotifier() : super(SyncState());

  void setOnlineStatus(bool isOnline) {
    state = state.copyWith(isOnline: isOnline);
  }

  void setSyncing(bool isSyncing) {
    state = state.copyWith(isSyncing: isSyncing);
  }

  void setPendingSyncCount(int count) {
    state = state.copyWith(pendingSyncCount: count);
  }

  void updateLastSyncTime() {
    state = state.copyWith(lastSyncTime: DateTime.now());
  }

  void setSyncError(String? error) {
    state = state.copyWith(syncError: error);
  }

  Future<void> syncData() async {
    state = state.copyWith(isSyncing: true, syncError: null);
    
    try {
      // TODO: Implement sync logic
      // This will sync pending changes from local database to backend
      await Future.delayed(const Duration(seconds: 2));
      
      state = state.copyWith(
        isSyncing: false,
        pendingSyncCount: 0,
        lastSyncTime: DateTime.now(),
        syncError: null,
      );
    } catch (e) {
      state = state.copyWith(
        isSyncing: false,
        syncError: e.toString(),
      );
    }
  }
}

// Sync provider
final syncProvider = StateNotifierProvider<SyncNotifier, SyncState>((ref) {
  return SyncNotifier();
});

// Selectors
final isSyncingProvider = Provider<bool>((ref) {
  return ref.watch(syncProvider).isSyncing;
});

final isOnlineProvider = Provider<bool>((ref) {
  return ref.watch(syncProvider).isOnline;
});

final pendingSyncCountProvider = Provider<int>((ref) {
  return ref.watch(syncProvider).pendingSyncCount;
});

final lastSyncTimeProvider = Provider<DateTime?>((ref) {
  return ref.watch(syncProvider).lastSyncTime;
});

final syncErrorProvider = Provider<String?>((ref) {
  return ref.watch(syncProvider).syncError;
});
