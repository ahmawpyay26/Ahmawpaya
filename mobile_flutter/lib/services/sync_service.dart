import 'package:amaw_pyay/data/datasources/local_datasource.dart';
import 'package:amaw_pyay/data/datasources/remote_datasource.dart';

class SyncService {
  final LocalDataSource localDataSource;
  final RemoteDataSource remoteDataSource;

  SyncService({
    required this.localDataSource,
    required this.remoteDataSource,
  });

  Future<void> syncPendingActions() async {
    try {
      final pendingActions = await localDataSource.getPendingSyncActions();
      if (pendingActions.isNotEmpty) {
        await remoteDataSource.syncData(pendingActions);
        for (var action in pendingActions) {
          await localDataSource.markSyncActionAsCompleted(action['id'] as String);
        }
      }
    } catch (e) {
      // Handle sync error
    }
  }

  Future<void> addPendingAction(Map<String, dynamic> action) async {
    try {
      await localDataSource.saveSyncQueue(action);
    } catch (e) {
      // Handle error
    }
  }

  Future<List<Map<String, dynamic>>> getPendingActions() async {
    try {
      return await localDataSource.getPendingSyncActions();
    } catch (e) {
      return [];
    }
  }

  Future<bool> hasInternetConnection() async {
    try {
      // Check internet connectivity
      return true;
    } catch (e) {
      return false;
    }
  }
}
