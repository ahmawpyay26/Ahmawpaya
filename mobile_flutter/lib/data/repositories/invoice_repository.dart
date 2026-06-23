import 'package:dartz/dartz.dart';
import 'package:amaw_pyay/data/datasources/local_datasource.dart';
import 'package:amaw_pyay/data/datasources/remote_datasource.dart';

class InvoiceRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;

  InvoiceRepository({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  Future<Either<String, Map<String, dynamic>>> createInvoice(
    Map<String, dynamic> invoiceData,
  ) async {
    try {
      final result = await remoteDataSource.createInvoice(invoiceData);
      await localDataSource.saveInvoice(result);
      return Right(result);
    } catch (e) {
      await localDataSource.saveInvoice(invoiceData);
      return Left(e.toString());
    }
  }

  Future<Either<String, List<Map<String, dynamic>>>> getInvoices() async {
    try {
      final result = await remoteDataSource.getInvoices();
      for (var invoice in result) {
        await localDataSource.saveInvoice(invoice);
      }
      return Right(result);
    } catch (e) {
      return Left(e.toString());
    }
  }

  Future<Either<String, Map<String, dynamic>?>> getInvoice(String id) async {
    try {
      final result = await localDataSource.getInvoice(id);
      return Right(result);
    } catch (e) {
      return Left(e.toString());
    }
  }
}
